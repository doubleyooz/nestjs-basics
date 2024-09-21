import { ArgsType, Field } from "@nestjs/graphql";
import { IsNotEmpty, IsEmail } from "class-validator";

@ArgsType()
export class FindOneUserByEmailArgs {
    @Field()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}