import z from "zod";

// Zod: 입력값이 올바른지 검사하는 스키마 기반 검증 라이브러리.
function validateAndLog(schema, value)
{
    try 
    {
        const result = schema.parse(value);
        console.log(`성공: ${result}`)    
    } 
    catch (error) 
    {
        console.log(`에러: ${error} | 입력값: ${value}`)
    }
}

const nameSchema = z.toString("문자열이어야 해 !!")

validateAndLog(nameSchema, "abc");