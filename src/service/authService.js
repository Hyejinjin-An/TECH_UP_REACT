import { async } from "@firebase/util";
import { toaster } from "../components/ui/toaster";
import { firebaseErrorMessages } from "../config/firebaseError"
import { login } from "./auth";
import { googleSignIn } from "./auth_google_signIn";
import { signUp } from "./authSignUp";
import { uploadAvater } from "./storage";
import { updateProfile } from "firebase/auth";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

// 공통 옵션
const TOAST_OPTIONS = 
{
    duration: 5000,
    closable: true
}

export default function authService()
{
    // 아바터 업로드 후 유저 정보 업데이트를 위한 setUser
    const { setUser } = useContext(AuthContext);
    const getErrorMsg = (err) => 
    {
        return firebaseErrorMessages[err?.code]
    }

    const showLoginSuccessToast = (user) =>
    {
        const userName = user?.displayName || user?.email || "사용자";
        toaster.create({
            description: `${userName}님 환영합니다!`,
            type: "success",
            ...TOAST_OPTIONS
        })
    }

    const showLoginErrorToast = (error) =>
    {
        toaster.create({
            description: getErrorMsg(error),
            type: "error",
            ...TOAST_OPTIONS
        })
    }

    const loginWithEmail = async (email, password) => 
    {
        try 
        {
            const user = await login(email, password);
            showLoginSuccessToast(user)
            return user
        } 
        catch (error) 
        {
            showLoginErrorToast(error);
            throw error;
        }
    }

    const loginWithGoogle = async () =>
    {
        try 
        {
            const { user } = await googleSignIn();
            showLoginSuccessToast(user)
            return user    
        } 
        catch (error) 
        {
            showLoginErrorToast(error);
            throw error;
        }
    }

    // 2026.04.06
    // zod 기능 추가
    const signUpWithEmail = async (email, password, avatarFile = null) =>
    {
        try 
        {
            const user = await signUp(email, password);
            // firebase Storage 기능 관련 추가
            // 아바타 파일이 있는 경우
            if(avatarFile)
            {
                // firebase 쪽으로 보내주다
                const photoURL = await uploadAvater(user.uid, avatarFile)
                await updateProfile(user, {photoURL})
                user.photoURL = photoURL;
                // user 재설정
                setUser({...user})
            }
            showLoginSuccessToast(user)
            return user;    
        } 
        catch (error) 
        {
            showLoginErrorToast(error)
            throw error;
        }
    }


    return {
        loginWithEmail,
        loginWithGoogle,
        signUpWithEmail
    }

}