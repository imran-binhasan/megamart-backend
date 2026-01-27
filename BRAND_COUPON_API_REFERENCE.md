# Brand & Coupon APIs - Optimized Endpoints

## Overview
Both Brand and Coupon APIs have been optimized to use **5 core endpoints** with **comprehensive query support** and full **Swagger/OpenAPI documentation**.

---

## Brand API - Optimized Endpoints

### Core Endpoints: 5

#### 1. **POST** `/brand`
Create a new brand with optional logo

**Multipart Form Data:**
```json
{
  "name": "Samsung",
  "description": "Samsung is a leading electronics manufacturer",
  "logo": <file>  // optional
}
```

#### 2. **GET** `/brand`
List brands with advanced filtering

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=20` |
| `search` | string | Search by brand name | `?search=samsung` |
| `includeProducts` | boolean | Include related products | `?includeProducts=true` |
| `includeDeleted` | boolean | Include soft-deleted brands | `?includeDeleted=true` |

**Usage Examples:**
```bash
GET /brand                                    # All brands paginated
GET /brand?search=samsung                     # Search brands
GET /brand?includeProducts=true               # With products
GET /brand?page=2&limit=20                    # Pagination
```

#### 3. **GET** `/brand/:id`
Get single brand by ID

#### 4. **PATCH** `/brand/:id`
Update brand name/description/logo

**Multipart Form Data:**
```json
{
  "name": "Samsung Electronics",
  "description": "Updated description",
  "logo": <file>  // optional
}
```

#### 5. **DELETE** `/brand/:id`
Soft delete a brand (204 No Content)

### Removed Brand Endpoints
- ❌ `GET /brand/all` → Use `GET /brand?limit=999`
- ❌ `GET /brand/:id/products` → Use `GET /brand/:id` with `includeProducts=true`
- ❌ `GET /brand/stats/count` → Use `GET /brand` pagination response
- ❌ `PATCH /brand/:id/restore` → Managed through admin panel

---

## Coupon API - Optimized Endpoints

### Core Endpoints: 5

#### 1. **POST** `/coupon`
Create a new coupon

**Request Body:**
```json
{
  "name": "Summer Sale 2026",
  "code": "SUMMER2026",
  "couponType": "PERCENTAGE",
  "discountPercentage": 20,
  "maxDiscountAmount": 100,
  "minPurchase": 0,
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-06-30T23:59:59Z",
  "maxUsageLimit": 100
}
```

#### 2. **GET** `/coupon`
List coupons with advanced filtering

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=10` |
| `search` | string | Search by name or code | `?search=SUMMER2026` |
| `couponType` | enum | Filter by type (PERCENTAGE, FIXED) | `?couponType=PERCENTAGE` |
| `isActive` | boolean | Filter by active status | `?isActive=true` |
| `isExpired` | boolean | Filter by expired status | `?isExpired=false` |

**Usage Examples:**
```bash
GET /coupon                              # All coupons
GET /coupon?search=SUMMER2026            # Search by code
GET /coupon?couponType=PERCENTAGE        # Filter by type
GET /coupon?isActive=true                # Only active
GET /coupon?isActive=true&isExpired=false # Active & not expired
```

#### 3. **GET** `/coupon/:id`
Get single coupon by ID

#### 4. **PATCH** `/coupon/:id`
Update coupon details

#### 5. **DELETE** `/coupon/:id`
Soft delete a coupon (204 No Content)

### Additional Public Endpoints

#### **POST** `/coupon/validate`
Validate coupon code for customer

**Request Body:**
```json
{
  "code": "SUMMER2026",
  "amount": 500
}
```

**Response:**
```json
{
  "isValid": true,
  "discount": 20,
  "discountAmount": 100
}
```

### Removed Coupon Endpoints
- ❌ `GET /coupon/public/active` → Use `GET /coupon?isActive=true&isExpired=false` (public access)
- ❌ `GET /coupon/reports/stats` → Use `GET /coupon` pagination
- ❌ `GET /coupon/reports/expired` → Use `GET /coupon?isExpired=true`

---

## Swagger/OpenAPI Documentation

Both APIs now include comprehensive Swagger documentation:
- ✅ All endpoints documented with descriptions
- ✅ Request/response examples for all endpoints
- ✅ Query parameter descriptions
- ✅ Status codes and error responses
- ✅ Multipart form data support (Brand logo)
- ✅ Authorization headers (ApiBearerAuth)

### Access Swagger UI
```
GET /api/docs
```

---

## Benefits of This Optimization

✅ **Reduced Complexity**: 5 endpoints instead of 8-10+ per module
✅ **Flexible Querying**: All filtering through query parameters
✅ **Better Documentation**: Full Swagger integration
✅ **Consistent API Design**: Both modules follow same pattern
✅ **Easier Testing**: Fewer endpoints to test
✅ **Future-Proof**: Easy to add new filters without breaking existing endpoints
✅ **Scalability**: Single list endpoint for multiple use cases

---

## Migration Guide

### Brand API Changes
| Old Endpoint | New Endpoint | Notes |
|-------------|-------------|-------|
| `GET /brand/all` | `GET /brand?limit=999` | Get all without pagination |
| `GET /brand/:id/products` | `GET /brand/:id?includeProducts=true` | Can't query by ID with params |
| `GET /brand/stats/count` | Response in `pagination.total` | Total count in pagination |

### Coupon API Changes
| Old Endpoint | New Endpoint | Notes |
|-------------|-------------|-------|
| `GET /coupon/public/active` | `GET /coupon?isActive=true&isExpired=false` | Public access maintained |
| `GET /coupon/reports/stats` | `GET /coupon` pagination response | Stats in pagination |
| `GET /coupon/reports/expired` | `GET /coupon?isExpired=true` | Filter by expiry status |

---

## File Changes Summary

### Brand Module
- ✅ Created: `brand/dto/query-brand.dto.ts` - Query DTO with Swagger
- ✅ Updated: `brand/dto/create-brand.dto.ts` - Added Swagger decorators
- ✅ Updated: `brand/controller/brand.controller.ts` - 5 optimized endpoints + Swagger

### Coupon Module
- ✅ Updated: `coupon/dto/queryl-coupon.dto.ts` - Added Swagger decorators
- ✅ Updated: `coupon/dto/create-coupon.dto.ts` - Added Swagger decorators
- ✅ Updated: `coupon/controller/coupon.controller.ts` - 5 optimized endpoints + Swagger

