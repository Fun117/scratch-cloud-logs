require('dotenv').config()
const { default: axios } = require("axios");
const sqlite3 = require('sqlite3').verbose();
const Scratch = require("scratch-api");
const uuid = require('uuid');
const config = require('./websiteAuth.config.js');

// set .env
const env = process.env

// 新しいデータベースファイルを作成します
const db = new sqlite3.Database('new_database.db');

// テーブルを作成します
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS comment_database (comment_id TEXT, user_name TEXT, user_id INTEGER, uuid TEXT)");
});

// データを取得
db.serialize(() => {
    db.all("SELECT * FROM comment_database", (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        //console.log(rows);
    });
});

function checkCommentIdExists(commentId, callback) {
    db.get("SELECT comment_id FROM comment_database WHERE comment_id = ?", [commentId], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(false); // エラーが発生した場合は存在しないと判定します
        } else {
            if (row) {
                callback(true); // データが見つかった場合は存在すると判定します
            } else {
                callback(false); // データが見つからなかった場合は存在しないと判定します
            }
        }
    });
}

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
        await checkCommentAndReplies(user);
    }, config.checkCommentsTime); // ループ
});

// メインの関数
const checkCommentAndReplies = async (user) => {
    try {
        // コメントの取得
        const response = await axios.get(`https://api.scratch.mit.edu/users/${env.USER_NAME}/projects/${config.projectId}/comments`, {
            headers: {
                'Cache-Control': 'no-cache',
            }
        });
        const comments = response.data;
        
        // データベースを開く
        db.serialize(async () => {
            // コメントのループ
            for (const comment of comments) {
                // コメントのテキストと送信者の取得
                const commentText = comment.content;
                const authorName = comment.author.username.toLowerCase();

                let commentText_authContent_check = "false";
                if(commentText === config.commentAuth_en){
                    commentText_authContent_check = 'en';
                }else{
                    if(commentText === config.commentAuth_ja){
                        commentText_authContent_check = 'ja';
                    };
                };

                // 対象のコメントの場合
                if (commentText_authContent_check !== "false" && !(await hasSpecificReply(comment, comment.id, ''))) {
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
                    checkCommentIdExists(comment.id, async (exists)  => {
                        if (exists) {
                        } else {
                            if (user_data) {
                                //console.log(`- ${authorName} ウェブアカウントが存在します`);
                                // アカウント情報を変数に保存
                                const { id, public_metadata } = user_data;
                                // タグが"authentic"かどうか確認
                                if (public_metadata && public_metadata.tag && public_metadata.tag === 'authentic') {
                                    console.log(`- ${authorName} は"authentic"のタグを持っています`);
                                    // コメントを追加する
                                    user.addComment({
                                        user: authorName,
                                        content: config[`commentAuth_replyNotification_warn_${commentText_authContent_check}`],
                                    }, (err) => {
                                        if (err) return console.error("コメントの追加エラー:", err);
                                    });
                                    // データを追加
                                    db.run("INSERT INTO comment_database (comment_id, user_name, user_id, uuid) VALUES (?, ?, ?, ?)", [comment.id, authorName, id, uuid.v4()], function(err) {
                                        if (err) {
                                            console.error(err.message);
                                        } else {
                                            //console.log(`A row has been inserted with rowid ${this.lastID}`);
                                        }
                                    });
                                } else {
                                    //console.log(`${authorName} は"authentic"のタグを持っていません`);
                                    // "authentic"のタグを追加するためのAPIリクエストを送信
                                    await addAuthenticTag(id,authorName);
                                    // コメントを追加する
                                    user.addComment({
                                        user: authorName,
                                        content: config[`commentAuth_replyNotification_successful_${commentText_authContent_check}`],
                                    }, (err) => {
                                        if (err) return console.error("コメントの追加エラー:", err);
                                    });
                                    // データを追加
                                    db.run("INSERT INTO comment_database (comment_id, user_name, user_id, uuid) VALUES (?, ?, ?, ?)", [comment.id, authorName, id, uuid.v4()], function(err) {
                                        if (err) {
                                            console.error(err.message);
                                        } else {
                                            //console.log(`A row has been inserted with rowid ${this.lastID}`);
                                        }
                                    });
                                }
                            } else {
                                console.log(`- ${authorName} ウェブアカウントが存在しません`);
                                // コメントを追加する
                                user.addComment({
                                    user: authorName,
                                    content: config[`commentAuth_replyNotification_error_${commentText_authContent_check}`],
                                }, (err) => {
                                    if (err) return console.error("コメントの追加エラー:", err);
                                });
                                // データを追加
                                db.run("INSERT INTO comment_database (comment_id, user_name, user_id, uuid) VALUES (?, ?, ?)", [comment.id, authorName, 'null', uuid.v4()], function(err) {
                                    if (err) {
                                        console.error(err.message);
                                    } else {
                                        //console.log(`A row has been inserted with rowid ${this.lastID}`);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
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

// sqlite3 new_database.db "DROP TABLE IF EXISTS comment_database;"