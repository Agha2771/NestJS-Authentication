import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(email: string, password: string) {
    const user = new this.userModel({ email, password });
    return user.save();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
