import { ArgsType, Field } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@ArgsType()
export class FindOneUserByIdArgs {
    @Field()
    @IsNotEmpty()
    _id: string;
}