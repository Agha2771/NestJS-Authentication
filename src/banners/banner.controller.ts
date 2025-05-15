import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Body,
  Req,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CurrentUser } from '../users/decorator/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { successResponse, errorResponse } from '../common/response/response.helper';

const storage = diskStorage({
  destination: '/tmp/uploads/banners',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('list')
  async index(@Query('page') page: number, @Res() res: Response) {
    try {
      const banners = await this.bannerService.getActivePaginated(page);
      return res
        .status(HttpStatus.OK)
        .json(successResponse('Banners fetched successfully', banners));
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Failed to fetch banners'));
    }
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'desktop_banner', maxCount: 1 },
        { name: 'mobile_banner', maxCount: 1 },
        { name: 'flash_image', maxCount: 1 },
      ],
      {
        storage,
        fileFilter: (req, file, callback) => {
          const allowedMimes = ['image/jpeg', 'image/png', 'image/svg+xml'];
          if (!allowedMimes.includes(file.mimetype)) {
            return callback(new Error('Invalid file type'), false);
          }
          callback(null, true);
        },
      },
    ),
  )
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFiles() files: any,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    try {
      const userId = user?.userId || 'system';
      const banner = await this.bannerService.create(createBannerDto, files, userId);
      return res
        .status(HttpStatus.CREATED)
        .json(successResponse('Banner created successfully', banner));
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(errorResponse(e.message));
    }
  }

  @Post('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'desktop_banner', maxCount: 1 },
        { name: 'mobile_banner', maxCount: 1 },
        { name: 'flash_image', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ) {
    try {
      const banner = await this.bannerService.update(id, updateBannerDto, files);
      return res
        .status(HttpStatus.OK)
        .json(successResponse('Banner updated successfully', banner));
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(errorResponse(e.message));
    }
  }

  @Get('list')
  async getBanners(@Res() res: Response) {
    try {
      const banners = await this.bannerService.getInactiveBanners();
      return res
        .status(HttpStatus.OK)
        .json(successResponse('Inactive banners fetched successfully', banners));
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Failed to fetch inactive banners'));
    }
  }

  @Post('delete/:id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.bannerService.delete(id);
      return res
        .status(HttpStatus.OK)
        .json(successResponse('Banner deleted successfully'));
    } catch (e) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(errorResponse(e.message));
    }
  }

  @Get('active')
  async getActiveBanner(@Res() res: Response) {
    try {
      const banner = await this.bannerService.getActiveBanner();
      return res
        .status(HttpStatus.OK)
        .json(successResponse('Active banner fetched successfully', banner));
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse('Failed to fetch active banner'));
    }
  }
}
