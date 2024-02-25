require('dotenv').config()
const sqlite3 = require('sqlite3').verbose();
const { default: axios } = require("axios");
const Scratch = require("scratch-api");
const uuid = require('uuid');

// 新しいデータベースファイルを作成します
const db = new sqlite3.Database('new_database.db');

// テーブルを作成します
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS comment_database (comment_id TEXT, user_id INTEGER, uuid TEXT)");
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

const prof_com_text_1 = `ビル経営ゲーム / ウェブサイト\nウェブアカウントを認証は既に認証されています。`;
const prof_com_text_2 = `ビル経営ゲーム / ウェブサイト\nウェブアカウントを認証しました。今後のコメントには認証タグが自動的に追加されます。`;
const prof_com_text_3 = `ビル経営ゲーム / ウェブサイト\n要求された名前の Web アカウントが存在しないため、認証を実行できませんでした。 ユーザー名がScratchのユーザー名と異なる場合は、ウェブサイト運営チームまでご連絡ください。`;

const env = process.env
const projectId = '968979013';
const comment_auth_text = '@Auth';
const comment_auth_rep_text = 'auth';

Scratch.UserSession.create(env.USER_NAME, env.USER_PASSWORD, (err, user) => {
    if (err) return console.error(err);

    // メインの関数
    const checkCommentAndReplies = async () => {
        try {
            // コメントの取得
            const response = await axios.get(`https://api.scratch.mit.edu/users/${env.USER_NAME}/projects/${projectId}/comments`);
            const comments = response.data;
    
            // データベースを開く
            db.serialize(async () => {
                // コメントのループ
                for (const comment of comments) {
                    // コメントのテキストと送信者の取得
                    const commentText = comment.content;
                    const authorName = comment.author.username.toLowerCase();
    
                    // 対象のコメントかつ送信者が Fun_117 かつ特定の返信がある場合
                    if (commentText === comment_auth_text) {
                        // Clerk APIを使用してユーザー名の存在を確認
                        const clerkResponse = await axios.get(env.CLERK_API_URL_USERS, {
                            headers: {
                                Authorization: `Bearer ${env.CLERK_SECRET_KEY}`
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
                                        //console.log(`${id} は"authentic"のタグを持っています`);
                                        // コメントを追加する
                                        user.addComment({
                                            user: authorName,
                                            content: prof_com_text_1,
                                        }, (err) => {
                                            if (err) return console.error("コメントの追加エラー:", err);
                                        });
                                        // データを追加
                                        db.run("INSERT INTO comment_database (comment_id, user_id, uuid) VALUES (?, ?, ?)", [comment.id, id, uuid.v4()], function(err) {
                                            if (err) {
                                                console.error(err.message);
                                            } else {
                                                //console.log(`A row has been inserted with rowid ${this.lastID}`);
                                            }
                                        });
                                    } else {
                                        //console.log(`${id} は"authentic"のタグを持っていません`);
                                        // "authentic"のタグを追加するためのAPIリクエストを送信
                                        await addAuthenticTag(id);
                                        // コメントを追加する
                                        user.addComment({
                                            user: authorName,
                                            content: prof_com_text_2,
                                        }, (err) => {
                                            if (err) return console.error("コメントの追加エラー:", err);
                                        });
                                        // データを追加
                                        db.run("INSERT INTO comment_database (comment_id, user_id, uuid) VALUES (?, ?, ?)", [comment.id, id, uuid.v4()], function(err) {
                                            if (err) {
                                                console.error(err.message);
                                            } else {
                                                //console.log(`A row has been inserted with rowid ${this.lastID}`);
                                            }
                                        });
                                    }
                                } else {
                                    //console.log(`- ${authorName} ウェブアカウントが存在しません`);
                                    // コメントを追加する
                                    user.addComment({
                                        user: authorName,
                                        content: prof_com_text_3,
                                    }, (err) => {
                                        if (err) return console.error("コメントの追加エラー:", err);
                                    });
                                    // データを追加
                                    db.run("INSERT INTO comment_database (comment_id, user_id, uuid) VALUES (?, ?, ?)", [comment.id, 'null', uuid.v4()], function(err) {
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
    
    // メイン関数の呼び出し
    checkCommentAndReplies();
});

// 特定の返信が存在するかどうかをチェックする関数
const hasSpecificReply = async (comments, commentId, replyText) => {
    try {
        const replyUrl = `https://api.scratch.mit.edu/users/${env.USER_NAME}/projects/${projectId}/comments/${commentId}/replies`;
        const response = await axios.get(replyUrl);
        const replies = response.data;
        for (const reply of replies) {
            if (reply.content === replyText && reply.author.username.toLowerCase() === 'fun_117') {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('エラー:', error);
        return false;
    }
};

// "authentic"のタグを追加する関数
const addAuthenticTag = async (userId) => {
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
                Authorization: `Bearer ${env.CLERK_SECRET_KEY}`
            }
        });
        console.log(`${userId} のメタデータに"authentic"のタグを追加しました`);
    } catch (error) {
        console.error('エラー:', error);
    }
};
