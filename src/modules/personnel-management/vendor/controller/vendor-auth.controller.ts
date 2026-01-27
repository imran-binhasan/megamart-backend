import { Body, Controller, Post } from '@nestjs/common';
import { VendorAuthService } from '../service/vendor-auth.service';
import { VendorRegisterDto } from '../dto/vendor-register.dto';
import { VendorLoginDto } from '../dto/vendor-login.dto';
import { VendorAuthResponseDto } from '../dto/vendor-auth-response.dto';
import { Public } from 'src/core/auth/decorator/auth.decorator';
import { RefreshTokenDto } from 'src/core/auth/dto/refresh-token.dto';
import { TokenService } from 'src/core/auth/service/token-service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth - Vendor')
@Controller({ path: 'auth/vendor', version: '1' })
export class VendorAuthController {
  constructor(
    private vendorAuthService: VendorAuthService,
    private tokenService: TokenService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new vendor account' })
  @ApiResponse({
    status: 201,
    description: 'Vendor registered successfully',
  })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async register(
    @Body() dto: VendorRegisterDto,
  ): Promise<VendorAuthResponseDto> {
    return this.vendorAuthService.register(dto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Vendor login' })
  @ApiResponse({
    status: 200,
    description: 'Vendor logged in successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: VendorLoginDto): Promise<VendorAuthResponseDto> {
    return this.vendorAuthService.login(dto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh vendor access token' })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    return this.tokenService.generateTokenPair({
      sub: payload.sub,
      email: payload.email,
      type: payload.type,
    });
  }
}
