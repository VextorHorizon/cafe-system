import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectModel, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemSchema, MenuItemDocument } from './menu/menu.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
})
class SeedModule { }

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const menuItemModel = app.get<Model<MenuItemDocument>>(
    getModelToken(MenuItem.name),
  );

  const defaultItems = [
    { name: 'ลาเต้', price: 65, category: 'coffee' },
    { name: 'กาแฟดำ', price: 45, category: 'coffee' },
    { name: 'ชาดำ', price: 40, category: 'tea' },
    { name: 'มัทฉะลาเต้', price: 75, category: 'tea' },
    { name: 'โกโก้', price: 55, category: 'other' },
  ];

  const count = await menuItemModel.countDocuments(); // ฮันแน่ idempotent seed — ปลอดภัยรันกี่ครั้งก็ได้
  if (count > 0) {
    console.log(`⚠️  Database already has ${count} menu items. Skipping seed.`);
  } else {
    await menuItemModel.insertMany(defaultItems);
    console.log(`✅ Seeded ${defaultItems.length} menu items.`);
  }

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
