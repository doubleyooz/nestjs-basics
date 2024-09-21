import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserInput } from './dto/input/create-user.request';
  import { UpdateUserInput } from './dto/input/update-user.request';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    create(@Body() createUserDto: CreateUserInput) {
      return this.usersService.create(createUserDto);
    }
  
    @Get()
    findAll(
      @Query('name') name: string,
      @Query('email') email: string,   
    ) {
      return this.usersService.findAll({ name, email });
    }
  
    @Get(':id')
    findOneById(@Param('id') _id: string) {
      return this.usersService.findOneById({_id});
    }
  
    @Patch(':id')
    update(@Param('id') _id: string, @Body() updateUserinput: UpdateUserInput) {
      return this.usersService.update(_id, updateUserinput);
    }
  
    @Delete(':id')
    remove(@Param('id') _id: string) {
      return this.usersService.remove({_id});
    }
  }
  