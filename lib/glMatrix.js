/* 
 * glMatrix.js - High performance matrix and vector operations for WebGL
 * version 0.8 (Because no one want's to use a 0.1!)
 */
 
/*
 * Copyright (c) 2010 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// Fallback for systems that don't support WebGL 
if(typeof WebGLFloatArray != 'undefined') {
	glMatrixArrayType = WebGLFloatArray;
} else {
	glMatrixArrayType = Array;
}

/*
 * Vector
 */

var vec3 = {}

vec3.create = function(vec) {
	var dest = new glMatrixArrayType(3);
	
	if(vec) {
		dest[0] = vec[0];
		dest[1] = vec[1];
		dest[2] = vec[2];
	}
	
	return dest;
}

vec3.set = function(vec, dest) {
	dest[0] = vec[0];
	dest[1] = vec[1];
	dest[2] = vec[2];
	
	return dest;
} 

vec3.add = function(vec, vec2, dest) {
	if(!dest) { dest = vec; }
	
	if(vec == dest) {
		dest[0] += vec2[0];
		dest[1] += vec2[1];
		dest[2] += vec2[2];
	} else {
		dest[0] = vec[0] + vec2[0];
		dest[1] = vec[1] + vec2[1];
		dest[2] = vec[2] + vec2[2];
	}
	
	return dest;
}

vec3.subtract = function(vec, vec2, dest) {
	if(!dest) { dest = vec; }
	
	if(vec == dest) {
		dest[0] -= vec2[0];
		dest[1] -= vec2[1];
		dest[2] -= vec2[2];
	} else {
		dest[0] = vec[0] - vec2[0];
		dest[1] = vec[1] - vec2[1];
		dest[2] = vec[2] - vec2[2];
	}
	
	return dest;
}

vec3.negate = function(vec, dest) {
	if(!dest) { dest = vec; }
	
	dest[0] = -vec[0];
	dest[1] = -vec[1];
	dest[2] = -vec[2];
	
	return dest;
}

vec3.scale = function(vec, val, dest) {
	if(!dest) { dest = vec; }
	
	if(vec == dest) {
		dest[0] *= val;
		dest[1] *= val;
		dest[2] *= val;
	} else {
		dest[0] = vec[0] * val;
		dest[1] = vec[1] * val;
		dest[2] = vec[2] * val;
	}
	
	return dest;
}

vec3.normalize = function(vec, dest) {
	if(!dest) { dest = vec; }
	var x = vec[0], y = vec[1], z = vec[2];
	var len = Math.sqrt(x * x + y * y + z * z);
	if (len == 0) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
	} else if (len == 1) {
		dest[0] = x;
		dest[1] = y;
		dest[2] = z;
	} else {
		var ilen = 1 / len;
		dest[0] = x * ilen;
		dest[1] = y * ilen;
		dest[2] = z * ilen;
	}
	return dest;
}

vec3.cross = function(vec, vec2, dest){
	if(!dest) { dest = vec; }
	
	var x = vec[0], y = vec[1], z = vec[2];
	var x2 = vec[0], y2 = vec[1], z2 = vec[2];
	
	dest[0] = y*z2 - z*y2;
	dest[1] = z*x2 - x*z2;
	dest[2] = x*y2 - y*x2;
	
	return dest;
};

vec3.length = function(vec){
	var x = vec[0], y = vec[1], z = vec[2];
	return Math.sqrt(x * x + y * y + z * z);
};

vec3.dot = function(vec, vec2){
	return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
};

// TODO: Distance?

/*
 * Matrix (3x3)
 */

var mat3 = {}

mat3.create = function(mat) {
	var dest = new glMatrixArrayType(9);
	
	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
	}
	
	return dest
}

mat3.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	return dest;
}

/*
 * Matrix (4x4)
 */

var mat4 = {}

mat4.create = function(mat) {
	var dest = new glMatrixArrayType(16);
	
	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	return dest
}

mat4.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
}

mat4.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 1;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = 1;
	dest[11] = 0;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
}

mat4.transpose = function(mat, dest) {
	if(!dest) { dest = mat }
	
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if(mat == dest) { 
		var a01 = mat[1], a02 = mat[2], a03 = mat[3];
		var a12 = mat[6], a13 = mat[7];
		var a23 = mat[11];
		
		dest[1] = mat[4];
		dest[2] = mat[8];
		dest[3] = mat[12];
		dest[4] = a01;
		dest[6] = mat[9];
		dest[7] = mat[13];
		dest[8] = a02;
		dest[9] = a12;
		dest[11] = mat[14];
		dest[12] = a03;
		dest[13] = a13;
		dest[14] = a23;
	} else {
		dest[0] = mat[0];
		dest[1] = mat[4];
		dest[2] = mat[8];
		dest[3] = mat[12];
		dest[4] = mat[1];
		dest[5] = mat[5];
		dest[6] = mat[9];
		dest[7] = mat[13];
		dest[8] = mat[2];
		dest[9] = mat[6];
		dest[10] = mat[10];
		dest[11] = mat[14];
		dest[12] = mat[3];
		dest[13] = mat[7];
		dest[14] = mat[11];
		dest[15] = mat[15];
	}
}

mat4.determinant = function(mat) {
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	return	a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
			a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
			a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
			a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
			a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
			a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
}

mat4.inverse = function(mat, dest) {
	if(!dest) { dest = mat; }
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	// Calculate the determinant (inlined to avoid double-caching)
	var d = a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
			a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
			a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
			a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
			a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
			a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
	
	// Calculate the inverse.
	// NOTE: This is just bizzare. Apparently dividing by the determinant for each element is 
	// SIGNIFICANTLY faster than multiplying by 1/d. I have no idea why.
	dest[0] = (a21*a32*a13 - a31*a22*a13 + a31*a12*a23 - a11*a32*a23 - a21*a12*a33 + a11*a22*a33)/d;
	dest[1] = (a31*a22*a03 - a21*a32*a03 - a31*a02*a23 + a01*a32*a23 + a21*a02*a33 - a01*a22*a33)/d;
	dest[2] = (a11*a32*a03 - a31*a12*a03 + a31*a02*a13 - a01*a32*a13 - a11*a02*a33 + a01*a12*a33)/d;
	dest[3] = (a21*a12*a03 - a11*a22*a03 - a21*a02*a13 + a01*a22*a13 + a11*a02*a23 - a01*a12*a23)/d;
	dest[4] = (a30*a22*a13 - a20*a32*a13 - a30*a12*a23 + a10*a32*a23 + a20*a12*a33 - a10*a22*a33)/d;
	dest[5] = (a20*a32*a03 - a30*a22*a03 + a30*a02*a23 - a00*a32*a23 - a20*a02*a33 + a00*a22*a33)/d;
	dest[6] = (a30*a12*a03 - a10*a32*a03 - a30*a02*a13 + a00*a32*a13 + a10*a02*a33 - a00*a12*a33)/d;
	dest[7] = (a10*a22*a03 - a20*a12*a03 + a20*a02*a13 - a00*a22*a13 - a10*a02*a23 + a00*a12*a23)/d;
	dest[8] = (a20*a31*a13 - a30*a21*a13 + a30*a11*a23 - a10*a31*a23 - a20*a11*a33 + a10*a21*a33)/d;
	dest[9] = (a30*a21*a03 - a20*a31*a03 - a30*a01*a23 + a00*a31*a23 + a20*a01*a33 - a00*a21*a33)/d;
	dest[10] = (a10*a31*a03 - a30*a11*a03 + a30*a01*a13 - a00*a31*a13 - a10*a01*a33 + a00*a11*a33)/d;
	dest[11] = (a20*a11*a03 - a10*a21*a03 - a20*a01*a13 + a00*a21*a13 + a10*a01*a23 - a00*a11*a23)/d;
	dest[12] = (a30*a21*a12 - a20*a31*a12 - a30*a11*a22 + a10*a31*a22 + a20*a11*a32 - a10*a21*a32)/d;
	dest[13] = (a20*a31*a02 - a30*a21*a02 + a30*a01*a22 - a00*a31*a22 - a20*a01*a32 + a00*a21*a32)/d;
	dest[14] = (a30*a11*a02 - a10*a31*a02 - a30*a01*a12 + a00*a31*a12 + a10*a01*a32 - a00*a11*a32)/d;
	dest[15] = (a10*a21*a02 - a20*a11*a02 + a20*a01*a12 - a00*a21*a12 - a10*a01*a22 + a00*a11*a22)/d;
	
	return dest;
}

mat4.inverse3x3 = function(mat, dest) {
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10];
	
	var b01 = a22*a11-a12*a21;
	var b02 = -a22*a01+a02*a21;
	var b03 = a12*a01-a02*a11;
	var b11 = -a22*a10+a12*a20;
	var b12 = a22*a00-a02*a20;
	var b13 = -a12*a00+a02*a10;
	var b21 = a21*a10-a11*a20;
	var b22 = -a21*a00+a01*a20;
	var b23 = a11*a00-a01*a10;
		
	var d = a00 * (b01) + a01 * (b11) + a02 * (b21);
	if (d == 0) { return null; }
	var id = 1/d;
	
	if(!dest) { dest = mat3.create(); }
	
	dest[0] = b01*id;
	dest[1] = b02*id;
	dest[2] = b03*id;
	dest[3] = b11*id;
	dest[4] = b12*id;
	dest[5] = b13*id;
	dest[6] = b21*id;
	dest[7] = b22*id;
	dest[8] = b23*id;
	
	return dest;
}

mat4.multiply = function(mat, mat2, dest) {
	if(!dest) { dest = mat }
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
	var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
	var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
	var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
	
	dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
	dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
	dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
	dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
	dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
	dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
	dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
	dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
	dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
	dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
	dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
	dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
	dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
	dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
	dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
	dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
	
	return dest;
}

mat4.multiplyVec3 = function(mat, vec, dest) {
	if(!dest) { dest = vec }
	
	var x = vec[0], y = vec[1], z = vec[2];
	
	dest[0] = mat[0] * x + mat[1] * y + mat[2] * z + mat[3];
	dest[1] = mat[4] * x + mat[5] * y + mat[6] * z + mat[7];
	dest[2] = mat[8] * x + mat[9] * y + mat[10] * z + mat[11];
	
	return dest;
}

mat4.translate = function(mat, vec, dest) {
	if(!dest) { dest = mat }
	
	var x = vec[0], y = vec[1], z = vec[2];
	
	if(mat == dest) {
		dest[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
		dest[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
		dest[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
		dest[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
	} else {
		var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
		var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
		var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
		
		dest[0] = a00;
		dest[1] = a01;
		dest[2] = a02;
		dest[3] = a03;
		dest[4] = a10;
		dest[5] = a11;
		dest[6] = a12;
		dest[7] = a13;
		dest[8] = a20;
		dest[9] = a21;
		dest[10] = a22;
		dest[11] = a23;
		
		dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
		dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
		dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
		dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
	}
	
	return dest;
}

mat4.scale = function(mat, vec, dest) {
	if(!dest) { dest = mat }
	
	var x = vec[0], y = vec[1], z = vec[2];
	
	if(mat == dest) {
		dest[0] *= x;
		dest[1] *= x;
		dest[2] *= x;
		dest[3] *= x;
		dest[4] *= y;
		dest[5] *= y;
		dest[6] *= y;
		dest[7] *= y;
		dest[8] *= z;
		dest[9] *= z;
		dest[10] *= z;
		dest[11] *= z;
	} else {
		dest[0] = mat[0] * x;
		dest[1] = mat[1] * x;
		dest[2] = mat[2] * x;
		dest[3] = mat[3] * x;
		dest[4] = mat[4] * y;
		dest[5] = mat[5] * y;
		dest[6] = mat[6] * y;
		dest[7] = mat[7] * y;
		dest[8] = mat[8] * z;
		dest[9] = mat[9] * z;
		dest[10] = mat[10] * z;
		dest[11] = mat[11] * z;
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	return dest;
}

mat4.rotate = function(mat, angle, axis, dest) {
	if(!dest) { dest = mat }
	
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var t = 1-c;
	
	var x = axis[0], y = axis[1], z = axis[2];
	var len = Math.sqrt(x * x + y * y + z * z);
	if (len == 0) { return null; }
	if (len != 1) {
		var ilen = 1 / len;
		x *= ilen; y *= ilen; z *= ilen;
	}
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	
	// Check to see if we can perform an optimized multiply first (if the rotation is around a major axis)
	if (x == 1 || x == -1) {
		// Construct the elements of the rotation matrix
		var b00 = t+c;
		var b12 = x*s;
		var b21 = -x*s;
		
		// Perform axis-specific matrix multiplication
		dest[0] = a00*b00;
		dest[1] = a01*b00;
		dest[2] = a02*b00;
		dest[3] = a03*b00;
		
		dest[4] = a10*c + a20*b12;
		dest[5] = a11*c + a21*b12;
		dest[6] = a12*c + a22*b12;
		dest[7] = a13*c + a23*b12;
		
		dest[8] = a10*b21 + a20*c;
		dest[9] = a11*b21 + a21*c;
		dest[10] = a12*b21 + a22*c;
		dest[11] = a13*b21 + a23*c;
		
	} else if (y == 1 || y == -1) {
		// Construct the elements of the rotation matrix
		var b02 = -y*s;
		var b11 = t+c;
		var b20 = y*s;
		
		// Perform axis-specific matrix multiplication
		dest[0] = a00*c + a20*b02;
		dest[1] = a01*c + a21*b02;
		dest[2] = a02*c + a22*b02;
		dest[3] = a03*c + a23*b02;
		
		dest[4] = a10*b11;
		dest[5] = a11*b11;
		dest[6] = a12*b11;
		dest[7] = a13*b11;
		
		dest[8] = a00*b20 + a20*c;
		dest[9] = a01*b20 + a21*c;
		dest[10] = a02*b20 + a22*c;
		dest[11] = a03*b20 + a23*c;
		
	} else if (z == 1 || z == -1) {
		// Construct the elements of the rotation matrix
		var b01 = z*s;
		var b10 = -z*s;
		var b22 = t+c;
		
		// Perform axis-specific matrix multiplication
		dest[0] = a00*c + a10*b01;
		dest[1] = a01*c + a11*b01;
		dest[2] = a02*c + a12*b01;
		dest[3] = a03*c + a13*b01;
		
		dest[4] = a00*b10 + a10*c;
		dest[5] = a01*b10 + a11*c;
		dest[6] = a02*b10 + a12*c;
		dest[7] = a03*b10 + a13*c;
		
		dest[8] = a20*b22;
		dest[9] = a21*b22;
		dest[10] = a22*b22;
		dest[11] = a23*b22;
		
	} else { // If we don't have an optimized variation, do the general case
		// Construct the elements of the rotation matrix
		var b00 = x*x*t+c, b01 = y*x*t+z*s, b02 = z*x*t-y*s;
		var b10 = x*y*t-z*s, b11 = y*y*t+c, b12 = z*y*t+x*s;
		var b20 = x*z*t+y*s, b21 = y*z*t-x*s, b22 = z*z*t+c;
		
		// Perform rotation-specific matrix multiplication
		dest[0] = a00*b00 + a10*b01 + a20*b02;
		dest[1] = a01*b00 + a11*b01 + a21*b02;
		dest[2] = a02*b00 + a12*b01 + a22*b02;
		dest[3] = a03*b00 + a13*b01 + a23*b02;
		
		dest[4] = a00*b10 + a10*b11 + a20*b12;
		dest[5] = a01*b10 + a11*b11 + a21*b12;
		dest[6] = a02*b10 + a12*b11 + a22*b12;
		dest[7] = a03*b10 + a13*b11 + a23*b12;
		
		dest[8] = a00*b20 + a10*b21 + a20*b22;
		dest[9] = a01*b20 + a11*b21 + a21*b22;
		dest[10] = a02*b20 + a12*b21 + a22*b22;
		dest[11] = a03*b20 + a13*b21 + a23*b22;
	}
	
	// If the source and destination differ, copy the unchanged last row
	if(mat != dest) {
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}
	
	return dest;
}

mat4.frustum = function(left, right, bottom, top, near, far, dest) {
	dest[0] = (2 * near) / (right - left);
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 2 * near / (top - bottom);
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = (right + left) / (right - left);
	dest[9] = (top + bottom) / (top - bottom);
	dest[10] = -(far + near) / (far - near);
	dest[11] = -1;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = -(2 * far * near) / (far - near);
	dest[15] = 0;
	
	return dest;
}

mat4.perspective = function(fovy, aspect, near, far, dest) {
	var top = near * Math.tan(fovy * Math.PI / 360.0);
	var right = top * aspect;
	return mat4.frustum(-right, right, -top, top, near, far, dest);
}

mat4.ortho = function(left, right, bottom, top, near, far, dest) {
	dest[0] = 2 / (left - right);
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 2 / (top - bottom);
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = -2 / (far - near);
	dest[11] = 0;
	dest[12] = (left + right) / (left - right);
	dest[13] = (top + bottom) / (top - bottom);
	dest[14] = (far + near) / (far - near);
	dest[15] = 1;
	
	return dest;
}

// TODO: lookAt?