import { Type } from 'class-transformer';
import {
    Equals,
    IsDate,
    IsDefined,
    IsEmail,
    IsNotEmpty,
    IsString,
    IsUUID,
    Length,
    MaxDate,
    ValidateIf,
} from 'class-validator';
import { IsValidPassword } from '../../common/decorators/is.valid.password';

export class CreateUserDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @Length(8)
    @IsValidPassword()
    password: string;
}

export class FindOneUserDto {
    @ValidateIf(dto => dto.email !== undefined)
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ValidateIf(dto => dto.id !== undefined)
    @IsString()
    @IsNotEmpty()
    @Length(8)
    @IsUUID()
    id: string;
}
