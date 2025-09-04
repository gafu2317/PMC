// userService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Band, CreateBandRequest, UpdateBandRequest, ServiceResponse } from "../types/type";
import { validateCreateBandRequest, validateBandId, validateUpdateBandRequest } from "../utils/validations";

// バンドを作成する関数
export const addBand = async (request: CreateBandRequest): Promise<ServiceResponse<Band>> => {
  try {
    // 入力値検証 - バンド名とメンバーIDの形式・重複をチェック
    const validationError = validateCreateBandRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }
    
    const { name, memberIds } = request;
  
    // Firestoreにバンドドキュメントを作成
    const bandsColRef = collection(db, "bands");
    const docRef = await addDoc(bandsColRef, {
      name: name.trim(),        // 前後の空白を除去
      memberIds: memberIds,
    });
    
    // レスポンス用のバンドオブジェクトを作成
    const bandData: Band = {
      bandId: docRef.id,        // Firestoreが自動生成したID
      name: name.trim(),
      memberIds: memberIds,
    };
    
    console.log(`Band successfully added: ${docRef.id}`);
    return {
      success: true,
      data: bandData
    };
    
  } catch (error) {
    // 予期しないエラーの処理（ネットワークエラー、DB接続エラーなど）
    const errorMessage = `Failed to add band: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// すべてのバンドを取得する関数
export const getAllBands = async (): Promise<ServiceResponse<Band[]>> => {
  try {
    const bandsColRef = collection(db, "bands");
    const bandsDocs = await getDocs(bandsColRef);

    const bands: Band[] = bandsDocs.docs
      .map((doc) => {
        const data = doc.data();
        // 必須データの存在確認
        if (!data.name || !Array.isArray(data.memberIds)) {
          console.warn(`Incomplete band data for ${doc.id}:`, data);
          return null;
        }

        return {
          bandId: doc.id,
          name: data.name,
          memberIds: data.memberIds,
        };
      })
      .filter((band): band is Band => band !== null);

    console.log(`Retrieved ${bands.length} bands`);
    return {
      success: true,
      data: bands
    };

  } catch (error) {
    const errorMessage = `Failed to get all bands: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// バンド情報を更新する関数
export const updateBand = async (
  bandId: string,
  request: UpdateBandRequest
): Promise<ServiceResponse<void>> => {
  try {
    if (!validateBandId(bandId)) {
      return { success: false, error: "Invalid band ID" };
    }

    const validationError = validateUpdateBandRequest(request);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const updateData: any = {};
    if (request.name) updateData.name = request.name.trim();
    if (request.memberIds) updateData.memberIds = request.memberIds;

    await setDoc(doc(db, "bands", bandId), updateData, { merge: true });
    
    return { success: true };
  } catch (error) {
    const errorMessage = `Failed to update band ${bandId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return { success: false, error: errorMessage };
  }
};

// バンドを削除する関数
export const deleteBand = async (bandId: string): Promise<ServiceResponse<void>> => {
  try {
    // 入力値検証
    if (!validateBandId(bandId)) {
      return {
        success: false,
        error: "Invalid band ID: must be a non-empty string"
      };
    }

    await deleteDoc(doc(db, "bands", bandId));

    console.log(`Band successfully deleted: ${bandId}`);
    return {
      success: true
    };

  } catch (error) {
    const errorMessage = `Failed to delete band ${bandId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    return {
      success: false,
      error: errorMessage
    };
  }
};
// //バンドを追加する関数
// export const addBand = async (
//   name: string,
//   memberIds: string[]
// ): Promise<void> => {
//   try {
//     const docRef = collection(db, "bands"); //bandsコレクションの参照を取得
//     //バンド情報を追加
//     await addDoc(docRef, {
//       name: name,
//       memberIds: memberIds,
//     });
//     console.log("バンドが追加されました。");
//   } catch (error) {
//     console.error("バンドの追加に失敗しました:", error);
//   }
// };

// //バンドを削除する関数
// export const deleteBand = async (id: string): Promise<void> => {
//   try {
//     // bandsのドキュメントの参照を取得
//     const docRef = doc(db, "bands", id);

//     // ドキュメントを削除
//     await deleteDoc(docRef);

//     console.log("バンドが削除されました。");
//   } catch (error) {
//     console.error("バンドの削除に失敗しました:", error);
//   }
// };

// //バンドを更新する関数
// export const updateBand = async (
//   id: string,
//   name: string,
//   memberIds: string[]
// ): Promise<void> => {
//   try {
//     // bandsのドキュメントの参照を取得
//     const docRef = doc(db, "bands", id);

//     // ドキュメントを更新
//     await setDoc(docRef, { name: name, memberIds: memberIds }, { merge: true });

//     console.log("バンドが更新されました。");
//   } catch (error) {
//     console.error("バンドの更新に失敗しました:", error);
//   }
// };

// //バンドを取得する関数
// export const getAllBands = async (): Promise<Band[] | undefined> => {
//   try {
//     const bandsColRef = collection(db, "bands"); // bandsコレクションの参照を取得
//     const bandsDocs = await getDocs(bandsColRef); // コレクション内の全てのドキュメントを取得

//     const bands = bandsDocs.docs.map((doc) => ({
//       bandId: doc.id,
//       name: doc.data().name,
//       memberIds: doc.data().memberIds,
//     }));

//     return bands;
//   } catch (error) {
//     console.error("バンドの取得に失敗しました:", error);
//   }
// };