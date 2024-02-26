require('dotenv').config()
const { default: axios } = require("axios");
const Scratch = require("scratch-api");
const uuid = require('uuid');
const config = require('./websiteAuth.config.js');

// set .env
const env = process.env

let coolingDown = false; // クールダウン中を表すフラグ

// Scratchにログイン
Scratch.UserSession.create(env.USER_NAME, env.USER_PASSWORD, async (err, user) => {
    if (err) {
        console.error(err);
        return;
    }

    // 初回実行
    await checkCommentAndReplies(user);

    // 一定間隔で定期的に実行
    setInterval(async () => {
        if (!coolingDown) { // クールダウン中でない場合のみ実行
            await checkCommentAndReplies(user);
        }
    }, config.checkCommentsTime); // ループ
});


// 特定の返信が存在するかどうかをチェックする関数
const hasSpecificReply = async (comments, commentId, replyText) => {
    try {
        const replyUrl = `https://api.scratch.mit.edu/users/${env.USER_NAME}/projects/${config.projectId}/comments/${commentId}/replies`;
        const response = await axios.get(replyUrl);
        const replies = response.data;
        //console.log(commentId,replies)
        for (const reply of replies) {
            //console.log(reply.author.username.toLowerCase() === 'fun_117')
            if (reply.author.username.toLowerCase() === 'fun_117') {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('エラー:', error);
        return false;
    }
};

// メインの関数
const checkCommentAndReplies = async (user) => {
    try {
        // コメントの取得
        const response = await axios.get(`https://api.scratch.mit.edu/users/${env.USER_NAME}/projects/${config.projectId}/comments`);
        const comments = response.data;

        // コメントのループ
        for (const comment of comments) {
            // コメントのテキストと送信者の取得
            const commentText = comment.content;
            const authorName = comment.author.username.toLowerCase();

            let commentText_authContent_check;
            if(commentText === config.commentAuth_en){
                commentText_authContent_check = 'en';
            }else{
                if(commentText === config.commentAuth_ja){
                    commentText_authContent_check = 'ja';
                };
            };
            
            //console.log(authorName, !!commentText_authContent_check, !await hasSpecificReply(comment, comment.id, ''))

            // 対象のコメントの場合
            if (!!commentText_authContent_check && !await hasSpecificReply(comment, comment.id, '')) {
                //console.log('comment: ', config.projectId, comment.id, comment.author.id)
                // Clerk APIを使用してユーザー名の存在を確認
                const clerkResponse = await axios.get(env.CLERK_API_URL_USERS, {
                    headers: {
                        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
                        'Cache-Control': 'no-cache',
                    }
                });
                const users = clerkResponse.data;
                // ユーザー名の存在を確認
                const user_data = users.find(user_data => user_data.username === authorName);

                //console.log('コメント送信準備クールタイム 60s を開始します...');
                coolingDown = true; // クールダウンを開始
                setTimeout(() => {
                    coolingDown = false;
                }, 60000);

                if (user_data) {
                    //console.log(`- ${authorName} ウェブアカウントが存在します`);
                    // アカウント情報を変数に保存
                    const { id, public_metadata } = user_data;
                    // タグが"authentic"かどうか確認
                    if (public_metadata && public_metadata.tag && public_metadata.tag === 'authentic') {
                        // コメントを追加する
                        console.log(`- ${authorName} は"authentic"のタグを持っています`);
                        user.addComment({
                            project: config.projectId,
                            parent: comment.id,
                            replyto: comment.author.id,
                            content: config[`commentAuth_replyNotification_warn_${commentText_authContent_check}`],
                        }, (err) => {
                            if (err) return console.error("コメントの追加エラー:", err);
                        });
                    } else {
                        //console.log(`${authorName} は"authentic"のタグを持っていません`);
                        // "authentic"のタグを追加するためのAPIリクエストを送信
                        // コメントを追加する
                        await addAuthenticTag(id,authorName);
                        user.addComment({
                            project: config.projectId,
                            parent: comment.id,
                            replyto: comment.author.id,
                            content: config[`commentAuth_replyNotification_successful_${commentText_authContent_check}`],
                        }, (err) => {
                            if (err) return console.error("コメントの追加エラー:", err);
                        });
                    }
                } else {
                    // コメントを追加する
                    console.log(`- ${authorName} ウェブアカウントが存在しません`);
                    user.addComment({
                        project: config.projectId,
                        parent: comment.id,
                        replyto: comment.author.id,
                        content: config[`commentAuth_replyNotification_error_${commentText_authContent_check}`],
                    }, (err) => {
                        if (err) return console.error("コメントの追加エラー:", err);
                    });
                };
                //console.log('クールタイム 60s を開始します...');
                coolingDown = true; // クールダウンを開始
                setTimeout(() => {
                    coolingDown = false;
                }, 60000);
            };
        };
    } catch (error) {
        console.error('エラー:', error);
    }
};

// "authentic"のタグを追加する関数
const addAuthenticTag = async (userId,authorName) => {
    try {
        const apiUrl = `https://api.clerk.com/v1/users/${userId}/metadata`;
        const body = {
            public_metadata: {
                tag: 'authentic'
            },
            private_metadata: {},
            unsafe_metadata: {}
        };
        const response = await axios.patch(apiUrl, body, {
            headers: {
                Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
                'Cache-Control': 'no-cache',
            }
        });
        console.log(`- ${authorName} に"authentic"のタグを追加しました`);
    } catch (error) {
        console.error('エラー:', error);
    }
};
