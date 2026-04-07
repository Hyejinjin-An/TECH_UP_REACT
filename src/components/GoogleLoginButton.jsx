import { Box, Button } from "@chakra-ui/react";
import GoogleIcon from "../assets/google-svgrepo-com.svg";
import { googleSignIn } from "../service/auth_google_signIn";
import { toaster } from "./ui/toaster";
import authService from "../service/authService";


export default function GoogleLoginButton(isSubmitting) 
{
  const {loginWithGoogle} = authService();
  // TODO 로그인 결과로 user 등록하기
  const handleGoogleLogin = async () => {
    try 
    {
      const { loginUser } = await loginWithGoogle(); // {user : {}}
      console.log('user', user);
    } 
    catch (error) 
    {
      console.log(error);
    // throw error;
    }
  }

  return (
    <Button 
      width="100%"
      onClick={handleGoogleLogin}
      _hover={{ bg: "gray.400" }}
      variant="outline"
      loading={isSubmitting}
    >
      <Box 
        as="img" 
        src={GoogleIcon} 
        boxSize="20px"  // 크기 조절
        me={2}          // margin-end (오른쪽 여백)
      />
      Google로 계속하기
    </Button>
  )
}