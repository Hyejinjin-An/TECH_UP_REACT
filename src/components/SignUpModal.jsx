// src/components/SignUpModal.jsx
import { Button, Dialog, Field, Fieldset, FileUpload, HStack, Icon, Input, Portal, Separator, Text } from "@chakra-ui/react";
import { PasswordInput } from "./ui/password-input";
import { useContext, useEffect, useState } from "react";
import { signUp } from "../service/authSignUp.js";
import { firebaseErrorMessages } from "../config/firebaseError";
import GoogleLoginButton from "./GoogleLoginButton";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "../service/authService.js";
import { AuthContext } from "../contexts/AuthProvider.jsx";
import { LuUpload } from "react-icons/lu";
import { uploadAvater } from "../service/storage.js";
import { updateProfile } from "firebase/auth";


// 2026.04.03 zod 활용
const signupSchema = z.object({
    email: z.email("올바른 이메일 형식이 아닙니다."),
    password: z.string()
        .min(6, "비밀번호는 최소 6자 이상이어야 합니다.")
        .regex(/[[!@#$%^&*()]]/, "특수문자를 포함해야 합니다.")
        .regex(/[0-9]/, "숫자를 포함해야 합니다.")
        .regex(/[a-zA-Z]/, "영문자를 포함해야 합니다."),
    passwordConfirm: z.string()
}).refine( (d) => d.pw === d.passwordConfirm, {
    message: "비밀번호 불일치",
    path: ['passwordConfirm']
})

export default function SignUpModal() {
  const [open, setOpen] = useState(false);
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fireBaseError, setFireBaseError] = useState("");
  
  // 2026.04.06 추가
  const { signUpWithEmail } = authService();
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: {errors, isValid, isSubmitting},
    reset
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {email: "", password: "", passwordConfirm: ""}
  })

  const handleSignUpOnSubmit = async (data) => {
    // e.preventDefault(); // form 이라서 새로고침 방지
    setFireBaseError("")
    // if(password !== passwordConfirm)
    // {
    //   setError("비밀번호가 일치하지 않습니다.")
    //   return ;
    // }
    
    try 
    {
      // const user = await signUp(email, password)
      const user = await signUpWithEmail(data.email, data.password, avatarFile)
      console.log("회원가입 성공: ", user)
      setOpen(false) // 회원가입 창 닫기
      // setEmail("") // 이메일 초기화
      // setPassword("") // 패스워드 초기화
      // setPasswordConfirm("")
      reset() // zod 의 reset()
    } 
    catch (error) 
    {
      const errMsg = firebaseErrorMessages[error.code] || `회원가입 실패: ${error}`
      setFireBaseError(errMsg)
      console.error("(원) 회원가입 실패: ", error)
    }
  };

  // 회원가입 창 닫을 때 초기화
  useEffect( () => {
    if(!open)
    {
      // setEmail("");
      // setPassword("");
      // setPasswordConfirm("");
      reset()
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline">회원가입</Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>회원가입</Dialog.Title>
            <Dialog.CloseTrigger 
              size="lg" 
              fontSize={"2xl"} 
              m={3} 
              _hover={{opacity: 0.5}}
              cursor="pointer"
              variant="outline" >
              ×
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>
            <Fieldset.Root invalid={!isValid || !!fireBaseError}> 
              {/* 이메일, 비밀번호, 비밀번호 확인 구현 */}
              <Field.Root mb={4} invalid={!!errors.email}>
                <Field.Label>이메일</Field.Label>
                <Input 
                  type="text"
                  placeholder="이메일을 입력하세요"
                  // value={email}
                  // onChange={(e)=>setEmail(e.target.value)}
                  {...register("email")}
                />
                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root mb={4} invalid={!!errors.password}>
                <Field.Label>비밀번호</Field.Label>
                <PasswordInput 
                  // value={password}
                  // onChange={(e)=>{
                  //   return setPassword(e.target.value)
                  // }}
                  // onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                  {...register("password")}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root mb={4} isValid={!!errors.passwordConfirm}>
                <Field.Label>비밀번호 확인</Field.Label>
                <PasswordInput 
                  // value={passwordConfirm}
                  // onChange={(e)=>{
                  //   return setPasswordConfirm(e.target.value)
                  // }}
                  // onKeyDown={(e) => e.key === 'Enter' && handleSignUp(e)}
                  {...register("passwordConfirm")}
                />
                <Field.ErrorText>{errors.passwordConfirm?.message}</Field.ErrorText>
              </Field.Root>
              <Fieldset.ErrorText>{fireBaseError}</Fieldset.ErrorText>
              
              {/* 파일 업로드 부분 start */}
              <Field.Root mb={4}>
                <Field.Label>프로필 이미지(선택)</Field.Label>
                <FileUpload.Root
                  maxFiles={1}
                  accept="image/*"
                  onFileAccept={ (details) => setAvatarFile(details.files[0]) }
                >
                  <FileUpload.HiddenInput />
                  <FileUpload.Dropzone p={3} minH="80px">
                    <Icon color="fg.muted" as={LuUpload} />
                    <FileUpload.DropzoneContent>
                      드래그 또는 클릭하여 이미지 선택
                    </FileUpload.DropzoneContent>
                  </FileUpload.Dropzone>
                  <FileUpload.List showSize clearable />
                </FileUpload.Root>
              </Field.Root>
              {/* 파일 업로드 부분 end */}
              
              <Button
                type="submit"
                onClick={handleSubmit(handleSignUpOnSubmit)}
                width="100%"
                mt={4}
                // disabled={!!error}
                // disabled={
                //   email === "" || password === "" || passwordConfirm === ""
                // }
                loading={isSubmitting} // 업로드 전 submit 방지
              >
                회원가입
              </Button>

            </Fieldset.Root>

            {/* Google 로그인 버튼 추가 */}
            <HStack my={4}>
              <Separator flex="1" />
                <Text px={2} color="gray.500" fontSize="sm">
                  또는
                </Text>
              <Separator flex="1" />
            </HStack>
            <GoogleLoginButton isSubmitting={isSubmitting}/>

          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>

    </Dialog.Root>
  );
}