// userService.ts
import { db } from "./firebase";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { User, CreateUserRequest } from "../types/type";
import { ServiceResponse } from "../types/type";
import { validateCreateUserRequest, validateLineId   } from "../utils/validations";



// ユーザーを追加する関数
export const addUser = async (request: CreateUserRequest): Promise<ServiceResponse<User>> => {
  try {
    // 入力値検証 - 不正データによる問題を事前に防ぐ
    const validationError = validateCreateUserRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    const { lineId, name, studentId } = request;
    
    // 重複チェック - 同じLINE IDでの複数アカウント作成を防ぐ
    const existingUserResponse = await getUser(lineId);
    if (existingUserResponse.success) {
      return {
        success: false,
        error: `User with LINE ID ${lineId} already exists`
      };
    }

    // ユーザーデータ作成 - すべての料金フィールドを0で初期化
    const userData: User = {
      lineId: lineId.trim(),     // 前後の空白を除去
      name: name.trim(),         // 前後の空白を除去
      studentId: studentId,
      fine: 0,                   // 新規ユーザーは罰金なし
      performanceFee: 0,         // 新規ユーザーは出演費なし
      studyFee: 0,              // 新規ユーザーは学スタ費用なし
      unPaidFee: 0              // 新規ユーザーは未払いなし
    };

    // Firestoreに保存 - lineIdをドキュメントIDとして使用（一意性保証）
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, {
      name: userData.name,
      studentId: userData.studentId,
      fine: userData.fine,
      performanceFee: userData.performanceFee,
      studyFee: userData.studyFee,
      unPaidFee: userData.unPaidFee
    });

    // 成功ログ - 運用時のトラブルシューティングに有用
    console.log(`User successfully added: ${lineId}`);
    return {
      success: true,
      data: userData
    };

  } catch (error) {
    // 詳細なエラーログ - どのユーザーで何が失敗したかを記録
    const errorMessage = `Failed to add user ${request.lineId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// ユーザーを取得する関数
export const getUser = async (lineId: string): Promise<ServiceResponse<User>> => {
  try {
    // 入力値検証 - 不正なIDでのデータベースアクセスを防ぐ
    if (!validateLineId(lineId)) {
      return {
        success: false,
        error: "Invalid LINE ID: must be a non-empty string"
      };
    }

    const docRef = doc(db, "users", lineId);
    const docSnap = await getDoc(docRef);

    // 存在チェック - 存在しないユーザーへの処理を明確にエラーとして扱う
    if (!docSnap.exists()) {
      return {
        success: false,
        error: `User not found: ${lineId}`
      };
    }

    const data = docSnap.data();
    // デフォルト値設定 - 古いデータや不完全なデータへの対応
    const user: User = {
      lineId: docSnap.id,
      name: data.name || "",                    // 名前がない場合は空文字
      studentId: data.studentId || 0,           // 学生IDがない場合は0
      fine: data.fine || 0,                     // 罰金がない場合は0
      performanceFee: data.performanceFee || 0, // 出演費がない場合は0
      studyFee: data.studyFee || 0,             // 学スタ費用がない場合は0
      unPaidFee: data.unPaidFee || 0            // 未払いがない場合は0
    };

    return {
      success: true,
      data: user
    };

  } catch (error) {
    // エラーログ - どのユーザーの取得で失敗したかを記録
    const errorMessage = `Failed to get user ${lineId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 全ユーザーを取得する関数
export const getAllUsers = async (): Promise<ServiceResponse<User[]>> => {
  try {
    const userColRef = collection(db, "users");
    const userDocs = await getDocs(userColRef);

    // データ変換とフィルタリング - 不完全なデータを除外して安全な配列を作成
    const users: User[] = userDocs.docs
      .map((doc) => {
        const data = doc.data();
        // 必須データの存在確認 - 不完全なデータによる実行時エラーを防ぐ
        if (!data.name || typeof data.studentId !== 'number') {
          console.warn(`Incomplete user data for ${doc.id}:`, data);
          return null; // 不完全なデータは除外
        }

        return {
          lineId: doc.id,
          name: data.name,
          studentId: data.studentId,
          fine: data.fine || 0,                     // 古いデータ対応
          performanceFee: data.performanceFee || 0, // 古いデータ対応
          studyFee: data.studyFee || 0,             // 古いデータ対応
          unPaidFee: data.unPaidFee || 0            // 古いデータ対応
        };
      })
      .filter((user): user is User => user !== null); // null値を除外

    // 取得件数ログ - 運用時の状況把握に有用
    console.log(`Retrieved ${users.length} users`);
    return {
      success: true,
      data: users
    };

  } catch (error) {
    // エラーログ - 全ユーザー取得失敗の詳細を記録
    const errorMessage = `Failed to get all users: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// ユーザーを削除する関数
export const deleteUser = async (lineId: string): Promise<ServiceResponse<void>> => {
  try {
    // 入力値検証 - 不正なIDでの削除処理を防ぐ
    if (!validateLineId(lineId)) {
      return {
        success: false,
        error: "Invalid LINE ID: must be a non-empty string"
      };
    }

    // 存在チェック - 存在しないユーザーの削除試行をエラーとして扱う
    const existingUserResponse = await getUser(lineId);
    if (!existingUserResponse.success) {
      return {
        success: false,
        error: `Cannot delete user: ${existingUserResponse.error}`
      };
    }

    const docRef = doc(db, "users", lineId);
    await deleteDoc(docRef);

    // 成功ログ - どのユーザーが削除されたかを記録
    console.log(`User successfully deleted: ${lineId}`);
    return {
      success: true
    };

  } catch (error) {
    // エラーログ - どのユーザーの削除で失敗したかを記録
    const errorMessage = `Failed to delete user ${lineId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// 罰金情報を追加
export const addFine = async (lineId: string, fine: number): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, { fine:  fine }, { merge: true });
    console.log("罰金が追加されました。");
  } catch (error) {
    console.error("罰金の追加に失敗しました:", error);
  }
};

// 罰金情報を削除
export const deleteFine = async (lineId: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, { fine: 0 }, { merge: true });
    console.log("罰金が削除されました。");
  } catch (error) {
    console.error("罰金の削除に失敗しました:", error);
  }
};

// 未払いの料金を上書きする関数
export const addUnpaidFee = async (
  lineId: string,
  unPaidFee: number
): Promise<void> => {
  try {
    if (!lineId) {
      console.error("無効なLine IDです。");
      return;
    }
    const docRef = doc(db, "users", lineId);
    // 未払い料金を上書き
    await setDoc(docRef, { unPaidFee }, { merge: true });
    console.log("未払い料金が上書きされました。");
  } catch (error) {
    console.error("未払い料金の上書きに失敗しました:", error);
  }
};

// 未払いの料金を削除する関数
export const deleteUnpaidFee = async (lineId: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", lineId);
    await setDoc(docRef, { unpaidFee: 0 }, { merge: true });
    console.log("未払い料金が削除されました。");
  } catch (error) {
    console.error("未払い料金の削除に失敗しました:", error);
  }
};

// 複数のユーザーの学スタ使用料、出演費を一度に更新する関数
export const updateMemberFees = async (
  updates: { lineId: string; studyFee: number; performanceFee: number }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // 各ユーザーの更新をバッチに追加
    updates.forEach(({ lineId, studyFee, performanceFee }) => {
      const docRef = doc(db, "users", lineId);
      batch.set(docRef, { 
        studyFee: studyFee,
        performanceFee: performanceFee 
      }, { merge: true });
    });
    
    // バッチ処理を実行
    await batch.commit();
    console.log(`${updates.length}人のユーザーの料金情報が更新されました。`);
  } catch (error) {
    console.error("料金情報の一括更新に失敗しました:", error);
    throw error;
  }
};

//ユーザーの料金を未払金に追加する関数(その他の料金をゼロにする)
export const batchUpdateUnpaidFees = async (
  updates: { lineId: string; unPaidFee: number }[]
): Promise<void> => {
  try {
    // バッチ処理の初期化
    const batch = writeBatch(db);

    // 各ユーザーの未払金を更新
    for (const update of updates) {
      const userRef = doc(db, "users", update.lineId);

      // 現在のドキュメントを取得して存在確認（オプション）
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.warn(`ユーザー ${update.lineId} が存在しません`);
        continue;
      }

      // バッチに更新操作を追加
      batch.update(userRef, { unPaidFee: update.unPaidFee, studyFee: 0, performanceFee: 0, fine: 0 });
    }

    // バッチ処理を実行
    await batch.commit();
    console.log(`${updates.length}人のユーザーの未払金を更新しました`);
  } catch (error) {
    console.error("未払金の一括更新に失敗しました:", error);
    throw error;
  }
};


// 複数ユーザーの効率的な取得 - N+1問題を解決し、バッチ処理の基盤となる(作成した方がいいと言われたが、実際の使用例がないのでコメントアウト)
// export const getUsersByIds = async (lineIds: string[]): Promise<ServiceResponse<User[]>> => {
//   try {
//     // 入力配列の検証 - 空配列や不正な配列での処理を防ぐ
//     if (!Array.isArray(lineIds) || lineIds.length === 0) {
//       return {
//         success: false,
//         error: "Invalid line IDs: must be a non-empty array"
//       };
//     }

//     // 各IDの検証 - 不正なIDが混入していないかチェック
//     const invalidIds = lineIds.filter(id => !validateLineId(id));
//     if (invalidIds.length > 0) {
//       return {
//         success: false,
//         error: `Invalid LINE IDs: ${invalidIds.join(', ')}`
//       };
//     }

//     // 並列処理でパフォーマンス向上 - 複数ユーザーを効率的に取得
//     const userPromises = lineIds.map(lineId => getUser(lineId));
//     const userResponses = await Promise.all(userPromises);

//     const users: User[] = [];
//     const errors: string[] = [];

//     // レスポンスの仕分け - 成功したユーザーと失敗したユーザーを分離
//     userResponses.forEach((response, index) => {
//       if (response.success && response.data) {
//         users.push(response.data);
//       } else {
//         errors.push(`${lineIds[index]}: ${response.error}`);
//       }
//     });

//     // 部分的失敗の警告 - 一部のユーザーが取得できない場合の記録
//     if (errors.length > 0) {
//       console.warn("Some users could not be retrieved:", errors);
//     }

//     return {
//       success: true,
//       data: users
//     };

//   } catch (error) {
//     // エラーログ - バッチ取得失敗の詳細を記録
//     const errorMessage = `Failed to get users by IDs: ${error instanceof Error ? error.message : 'Unknown error'}`;
//     console.error(errorMessage, error);
//     return {
//       success: false,
//       error: errorMessage
//     };
//   }
// };

// // ユーザーを追加する関数(旧版)
// export const addUser = async (
//   name: string,
//   lineId: string,
//   studentId: string
// ): Promise<void> => {
//   try {
//     // usersドキュメントの参照を取得
//     const docRef = doc(db, "users", lineId);
//     // ユーザー情報を追加
//     await setDoc(docRef, {
//       name: name,
//       studentId: studentId,
//       fine: 0,
//       unPaidFee: 0,
//       performanceFee: 0,
//       studyFee: 0,
//     });
//     console.log(`ユーザーが追加されました。`);
//   } catch (error) {
//     console.error("ユーザーの追加に失敗しました:", error);
//   }
// };
// User service functions

// // ユーザーを削除する関数(旧版)
// export const deleteUser = async (lineId: string): Promise<void> => {
//   try {
//     // usersのドキュメントの参照を取得
//     const docRef = doc(db, "users", lineId);

//     // ドキュメントを削除
//     await deleteDoc(docRef);

//     console.log("ユーザーが削除されました。");
//   } catch (error) {
//     console.error("ユーザーの削除に失敗しました:", error);
//   }
// };

// // ユーザーの情報を取得する関数(旧版)
// export const getAllUser = async (): Promise<Member[]> => {
//   try {
//     const userColRef = collection(db, "users"); //usersコレクションの参照を取得
//     const userDocs = await getDocs(userColRef); //コレクション内の全てのドキュメントを取得
//     const users = userDocs.docs.map((doc) => ({
//       lineId: doc.id,
//       name: doc.data().name || "データなし",
//       studentId: doc.data().studentId || 0,
//       fine: doc.data().fine || 0,
//       unPaidFee: doc.data().unPaidFee || 0,
//       performanceFee: doc.data().performanceFee || 0,
//       studyFee: doc.data().studyFee || 0,
//     }));
//     return users;
//   } catch (error) {
//     console.error("ユーザーの取得に失敗しました:", error);
//     return [];
//   }
// };

