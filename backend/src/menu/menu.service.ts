import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  async findAll(): Promise<MenuItemDocument[]> {
    return this.menuItemModel.find({ isActive: true }).exec();
  }

  async create(createMenuDto: CreateMenuDto): Promise<MenuItemDocument> {
    const menuItem = new this.menuItemModel(createMenuDto);
    return menuItem.save();
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
  ): Promise<MenuItemDocument> {
    const menuItem = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuDto, { new: true })
      .exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return menuItem;
  }

  async remove(id: string): Promise<MenuItemDocument> {
    const menuItem = await this.menuItemModel.findByIdAndDelete(id).exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return menuItem;
  }
}
