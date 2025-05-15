import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import moment from 'moment-timezone';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async getActivePaginated(page = 1) {
    const limit = 10;
    const skip = (page - 1) * limit;
    
    return this.bannerModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });
  }

  async create(createBannerDto: CreateBannerDto, files: any, userId: string) {
    const startUTC = moment.tz(createBannerDto.start_time, 'America/Los_Angeles').utc().toDate();
    const endUTC = moment.tz(createBannerDto.end_time, 'America/Los_Angeles').utc().toDate();

    const overlap = await this.bannerModel.findOne({
      start_at: { $lt: endUTC },
      end_at: { $gt: startUTC },
    });

    if (overlap) {
      throw new BadRequestException('Time range overlaps with another banner.');
    }

    const banner = new this.bannerModel({
      ...createBannerDto,
      start_at: startUTC,
      end_at: endUTC,
      desktop_banner: files.desktop_banner?.[0]?.path,
      mobile_banner: files.mobile_banner?.[0]?.path,
      flash_image: files.flash_image?.[0]?.path,
      created_by: userId,
      is_active: false,
    });

    return banner.save();
  }

  async update(id: string, updateDto: UpdateBannerDto, files: any) {
    const banner = await this.bannerModel.findById(id);
    if (!banner) throw new NotFoundException('Banner not found');

    let start_at = banner.start_at;
    let end_at = banner.end_at;

    if (updateDto.start_time) {
      start_at = moment.tz(updateDto.start_time, 'America/Los_Angeles').utc().toDate();
    }
    if (updateDto.end_time) {
      end_at = moment.tz(updateDto.end_time, 'America/Los_Angeles').utc().toDate();
    }

    const overlap = await this.bannerModel.findOne({
      _id: { $ne: id },
      start_at: { $lt: end_at },
      end_at: { $gt: start_at },
    });

    if (overlap) {
      throw new BadRequestException('Time range overlaps with another banner.');
    }

    const updateData: Partial<Banner> = {
      ...updateDto,
      start_at,
      end_at,
    };

    if (files?.desktop_banner?.[0]) {
      updateData.desktop_banner = files.desktop_banner[0].path;
    }
    if (files?.mobile_banner?.[0]) {
      updateData.mobile_banner = files.mobile_banner[0].path;
    }
    if (files?.flash_image?.[0]) {
      updateData.flash_image = files.flash_image[0].path;
    }

    return this.bannerModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getInactiveBanners() {
    return this.bannerModel
      .find({ is_active: false })
      .select('id name')
      .exec();
  }

  async delete(id: string) {
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return { message: 'Successfully deleted!' };
  }

  async getActiveBanner() {
    const banner = await this.bannerModel.findOne({ is_active: true });
    
    if (!banner) {
      return { message: 'No active banner found!', data: null };
    }

    const now = moment().tz('America/Los_Angeles');
    const endTime = moment(banner.end_at).tz('America/Los_Angeles');
    const totalSeconds = endTime.diff(now, 'seconds');

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        banner,
        timeLeft: {
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds),
        }
    };
  }
}
