---
description: Scaffold a new NestJS feature module following the project's exact patterns (module, controller, service, DTOs, registered in app.module.ts)
---

Scaffold a new NestJS feature module for the ShopHub backend. If the module name wasn't provided in the command, ask: "What is the name of the new module? (e.g. reviews, wishlist, notifications)"

Use the provided name (lowercase, kebab-case for files; PascalCase for class names).

## Files to Create

### 1. `backend/src/{name}/{name}.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { {Name}Controller } from './{name}.controller';
import { {Name}Service } from './{name}.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [{Name}Controller],
  providers: [{Name}Service],
  exports: [{Name}Service],
})
export class {Name}Module {}
```

### 2. `backend/src/{name}/{name}.controller.ts`
```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type JwtPayload } from '../auth/decorators/current-user.decorator';
import { {Name}Service } from './{name}.service';

@ApiTags('{Name}')
@Controller('{name}')
export class {Name}Controller {
  constructor(private readonly {name}Service: {Name}Service) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all {name} records for the current user' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.{name}Service.findAll(user.sub);
  }
}
```

### 3. `backend/src/{name}/{name}.service.ts`
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class {Name}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    // TODO: implement
    return [];
  }
}
```

### 4. `backend/src/{name}/dto/create-{name}.dto.ts`
```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create{Name}Dto {
  @ApiProperty({ example: 'example value' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

## Register in App Module
Open `backend/src/app.module.ts` and add the new module:

1. Add import at top: `import { {Name}Module } from './{name}/{name}.module';`
2. Add `{Name}Module` to the `imports: []` array

## After Scaffolding
1. Tell the user the files that were created
2. Remind them to add the Prisma model if needed (`backend/prisma/schema.prisma`) and run `npm run db:push && npx prisma generate`
3. Remind them to restart the backend dev server: `npm run start:dev`
4. Give the URL of the new endpoints: `http://localhost:3001/api/{name}`
