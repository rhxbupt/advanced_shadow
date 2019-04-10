    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
 
    //设置阴影贴图顶点着色器
    var shadowVertexShaderSource = `
        attribute vec4 a_Position;
        uniform mat4 u_MvpMatrix;
        void main(){
           gl_Position = u_MvpMatrix * a_Position; //计算出在灯源视点下各个坐标的位置
        }
        `;
 
    //设置阴影贴图的片元着色器
    var shadowFragmentShaderSource = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        
        void main(){
           gl_FragColor = vec4( 0.0, 0.0, 0.0, gl_FragCoord.z); //将灯源视点下的每个顶点的深度值存入绘制的颜色内
           
        }
        `;
 
    //正常绘制的顶点着色器
    var vertexShaderSource = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_MvpMatrix;                               //顶点的模型投影矩阵
        uniform mat4 u_MvpMatrixFromLight;                      //顶点基于光源的模型投影矩阵
        varying vec4 v_PositionFromLight;                       //将基于光源的顶点位置传递给片元着色器
        varying vec4 v_Color;                                   //将颜色传递给片元着色器
        void main(){
         gl_Position = u_MvpMatrix * a_Position;                    //计算并设置顶点的位置
         v_PositionFromLight = u_MvpMatrixFromLight * a_Position;   //计算基于光源的顶点位置
         v_Color = a_Color;
        }
        `;
 
    //正常绘制的片元着色器
    // var fragmentShaderSource = `
    //     #ifdef GL_ES
    //     precision mediump float;
    //     #endif
    //     uniform sampler2D u_shadowMap;                                                  //纹理的存储变量
    //     varying vec4 v_PositionFromLight;                                               //从顶点着色器传过来的基于光源的顶点坐标
    //     varying vec4 v_Color;//顶点的颜色
    //     void main(){
    //     vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
    //     vec4 rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy);
    //     float depth = rgbaDepth.a;
    //     float visibility = (shadowCoord.z > depth + 0.005) ? 0.2 : 1.0;
    //     gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
    //     }
    //     `;


    // PCSS
    // var fragmentShaderSource = `
    //     #ifdef GL_ES
    //     precision mediump float;
    //     #endif
    //     uniform sampler2D u_shadowMap;//纹理的存储变量
    //     varying vec4 v_PositionFromLight;//从顶点着色器传过来的基于光源的顶点坐标
    //     varying vec4 v_Color;//顶点的颜色

    //     float unpack(const in vec4 rgbaDepth) {
    //         const vec4 bitShift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
    //         return dot(rgbaDepth, bitShift);
    //     }

    //     float findblocker(vec3 shadowCood, sampler2D shadowMap, float lightsize){
    //         vec2 poissonDisk[16];
    //         poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
    //         poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
    //         poissonDisk[2] = vec2( -0.094184101, -0.92938870);
    //         poissonDisk[3] = vec2( 0.34495938, 0.29387760 );
    //         poissonDisk[4] = vec2( -0.91588581, 0.45771432 );
    //         poissonDisk[5] = vec2( -0.81544232, -0.87912464 );
    //         poissonDisk[6] = vec2( -0.38277543, 0.27676845 );
    //         poissonDisk[7] = vec2( 0.97484398, 0.75648379 );
    //         poissonDisk[8] = vec2( 0.44323325, -0.97511554 );
    //         poissonDisk[9] = vec2( 0.53742981, -0.47373420 );
    //         poissonDisk[10] = vec2( -0.26496911, -0.41893023 );
    //         poissonDisk[11] = vec2( 0.79197514, 0.19090188 );
    //         poissonDisk[12] = vec2( -0.24188840, 0.99706507 );
    //         poissonDisk[13] = vec2( -0.81409955, 0.91437590 );
    //         poissonDisk[14] = vec2( 0.19984126, 0.78641367 );
    //         poissonDisk[15] = vec2( 0.14383161, -0.14100790 );
    //         float Near = 0.1;
    //         float blocker = 0.0;
    //         float sumBlocker = 0.0;
    //         float searchWidth = lightsize * (shadowCood.z - Near) / shadowCood.z; 
    //         for(int i =0; i< 16; i++){
    //             vec4 depth = texture2D(shadowMap, shadowCood.xy + poissonDisk[i]*searchWidth);
    //             if(unpack(depth) + 0.1 < shadowCood.z){
    //                 sumBlocker += unpack(depth);
    //                 blocker += 1.0;
    //             }

    //         }
    //         if(blocker > 0.0){
    //             return sumBlocker/blocker;
    //         }
            
    //         return -1.0;
    //     }

       
    //     void main(){
            
    
    //     float lightsize = 0.5/3.75;
    //     vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
    //     // blocker search
    //     float blockerDistance = findblocker(shadowCoord, u_shadowMap, lightsize);
	// 	if(blockerDistance == -1.0){
    //         gl_FragColor = vec4(v_Color.rgb*0.3, v_Color.a);
    //     }
    //     else{
    //         // penumbra estimation
    //         float penumbraWidth = (shadowCoord.z - blockerDistance) / blockerDistance;
            
    //         float shadows =0.0;
    //         float opacity=0.6;// 阴影alpha值, 值越小暗度越深a
    //         float texelSize=1.0/1024.0;// 阴影像素尺寸,值越小阴影越逼真
    //         vec4 rgbaDepth;
           
    //         for (float i = -50.0; i <= 50.0; i+=1.0){
    //             for(float j = -50.0; j <= 50.0; j+=1.0){
    //                 if(j<-penumbraWidth || j>=penumbraWidth || i < -penumbraWidth || i>=penumbraWidth){
    //                     break;
    //                 }
    //                 rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(i,j)*texelSize);
    //                 shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
    //             }
    //         }

    //         shadows /=((2.0 * penumbraWidth + 1.0) * (2.0 * penumbraWidth + 1.0));
    //         float visibility = 0.3+(1.0-shadows);
    //         gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
    //     }
    // }
    //     `;


    //implemented the PCF
        
        var fragmentShaderSource = `
            #ifdef GL_ES
                precision mediump float;
            #endif
            uniform sampler2D u_shadowMap;
            varying vec4 v_PositionFromLight;
            varying vec4 v_Color;

            // depth
            float unpack(const in vec4 rgbaDepth) {
           
            const vec4 bitShift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
            return dot(rgbaDepth, bitShift);
            }
            void main(){
                vec2 poissonDisk[16];
                poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
   	            poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
   	            poissonDisk[2] = vec2( -0.094184101, -0.92938870 );
   	            poissonDisk[3] = vec2( 0.34495938, 0.29387760 );
   	            poissonDisk[4] = vec2( -0.91588581, 0.45771432 );
   	            poissonDisk[5] = vec2( -0.81544232, -0.87912464 );
   	            poissonDisk[6] = vec2( -0.38277543, 0.27676845 );
   	            poissonDisk[7] = vec2( 0.97484398, 0.75648379 );
   	            poissonDisk[8] = vec2( 0.44323325, -0.97511554 );
   	            poissonDisk[9] = vec2( 0.53742981, -0.47373420 );
   	            poissonDisk[10] = vec2( -0.26496911, -0.41893023 );
   	            poissonDisk[11] = vec2( 0.79197514, 0.19090188 );
   	            poissonDisk[12] = vec2( -0.24188840, 0.99706507 );
   	            poissonDisk[13] = vec2( -0.81409955, 0.91437590 );
   	            poissonDisk[14] = vec2( 0.19984126, 0.78641367 );
   	            poissonDisk[15] = vec2( 0.14383161, -0.14100790 );
                
                
                vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
                float shadows =0.0;
                float opacity=0.6;// 阴影alpha值, 值越小暗度越深
                float texelSize=1.0/1024.0;// 阴影像素尺寸,值越小阴影越逼真
               
                vec4 rgbaDepth;
                
                    for(int i=0; i < 16; i++){
                        rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk[i]* texelSize);
                        
                        // if(shadowCoord.z > unpack(rgbaDepth) +0.005){
                        //     shadows += 0.2;
                        // }
                        // else{
                        //     shadows += 1.0;
                        // }

                        shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                        
                    }
                
                shadows/=16.0;// 4*4的样本
                float visibility=min(opacity+(1.0-shadows),1.0);
                gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
            }
        `;

    //生成的纹理的分辨率，纹理必须是标准的尺寸 256*256 1024*1024  2048*2048
    var resolution = 256;
    var offset_width = resolution;
    var offset_height = resolution;
 
    //灯光的位置
    var light_x = 0.0;
    var light_y = 7.0;
    var light_z = 2.0;
 
    function main() {
        var canvas = document.getElementById("canvas");
 
        var gl = getWebGLContext(canvas);
 
        if(!gl){
            console.log("无法获取WebGL的上下文");
            return;
        }
 
        //初始化阴影着色器，并获得阴影程序对象,相关变量的存储位置
        var shadowProgram = createProgram(gl, shadowVertexShaderSource, shadowFragmentShaderSource);
        shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, "a_Position");
        shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, "u_MvpMatrix");
        if(shadowProgram.a_Position < 0 || !shadowProgram.u_MvpMatrix ){
            console.log("无法获取到阴影着色器的相关变量");
            return;
        }
 
        //初始化正常绘制着色器，获取到程序对象并获取相关变量的存储位置
        var normalProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
        normalProgram.a_Position = gl.getAttribLocation(normalProgram, "a_Position");
        normalProgram.a_Color = gl.getAttribLocation(normalProgram, "a_Color");
        normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, "u_MvpMatrix");
        normalProgram.u_MvpMatrixFromLight = gl.getUniformLocation(normalProgram, "u_MvpMatrixFromLight");
        normalProgram.u_ShadowMap = gl.getUniformLocation(normalProgram, "u_shadowMap");
        if(normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || !normalProgram.u_MvpMatrix || !normalProgram.u_MvpMatrixFromLight || !normalProgram.u_ShadowMap){
            console.log("无法获取到正常绘制着色器的相关变量");
            return;
        }
 
        //设置相关数据，并存入缓冲区内
        var triangle = initVertexBuffersForTriangle(gl);
        var plane = initVertexBuffersForPlane(gl);
        if(!triangle || !plane){
            console.log("无法设置相关顶点的信息");
            return;
        }
 
        //设置帧缓冲区对象
        var fbo = initFramebufferObject(gl);
        if(!fbo){
            console.log("无法设置帧缓冲区对象");
            return;
        }
 
        //开启0号纹理缓冲区并绑定帧缓冲区对象的纹理
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
 
        //设置背景设并开启隐藏面消除功能
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.enable(gl.DEPTH_TEST);
 
        //声明一个光源的变换矩阵
        var viewProjectMatrixFromLight = new Matrix4();
        viewProjectMatrixFromLight.setPerspective(70.0, offset_width/offset_height, 1.0, 100.0);
        viewProjectMatrixFromLight.lookAt(light_x, light_y, light_z,0.0,0.0,0.0,0.0,1.0,0.0);
 
        //为常规绘图准备视图投影矩阵
        var viewProjectMatrix = new Matrix4();
        viewProjectMatrix.setPerspective(45.0, canvas.width/canvas.height, 1.0, 100.0);
        viewProjectMatrix.lookAt(0.0,7.0,9.0,0.0,0.0,0.0,0.0,1.0,0.0);
 
        var currentAngle = 0.0; //声明当前旋转角度的变量
        var mvpMatrixFromLight_t = new Matrix4(); //光源（三角形）的模型投影矩阵
        var mvpMatrixFromLight_p = new Matrix4(); //光源（平面）的模型投影矩阵
 
        (function tick() {
            currentAngle = animate(currentAngle);
 
            //切换绘制场景为帧缓冲区
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.viewport(0.0,0.0,offset_height,offset_height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
            gl.useProgram(shadowProgram); //使用阴影程序对象绘制阴影纹理
 
            //绘制三角形和平面（用于生成阴影贴图）
            drawTriangle(gl, shadowProgram, triangle, currentAngle, viewProjectMatrixFromLight);
            mvpMatrixFromLight_t.set(g_mvpMatrix); //稍后使用
            drawPlane(gl, shadowProgram, plane, viewProjectMatrixFromLight);
            mvpMatrixFromLight_p.set(g_mvpMatrix); //稍后使用
 
            //解除帧缓冲区的绑定，绘制正常颜色缓冲区
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
            //切换为正常的程序对象并绘制
            gl.useProgram(normalProgram);
            gl.uniform1i(normalProgram.u_ShadowMap, 0.0);
 
            
            //绘制三角形和平面（正常绘制的图形）
            gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_t.elements);
            drawTriangle(gl, normalProgram, triangle, currentAngle, viewProjectMatrix);
            gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_p.elements);
            drawPlane(gl, normalProgram, plane, viewProjectMatrix);
 
            requestAnimationFrame(tick);
        })();
    }
 
    //声明坐标转换矩阵
    var g_modelMatrix = new Matrix4();
    var g_mvpMatrix = new Matrix4();
 
    function drawTriangle(gl,program,triangle,angle,viewProjectMatrix) {
        //设置三角形图形的旋转角度，并绘制图形
        g_modelMatrix.setRotate(angle, 0.0, 1.0, 0.0);
        draw(gl, program, triangle, viewProjectMatrix);
    }
 
    function drawPlane(gl, program, plane, viewProjectMatrix) {
        //设置平面图形的旋转角度并绘制
        g_modelMatrix.setRotate(0, 0.0, 1.0, 1.0);
        draw(gl, program, plane, viewProjectMatrix);
    }
    
    function draw(gl, program, obj, viewProjectMatrix) {
        initAttributeVariable(gl, program.a_Position, obj.vertexBuffer);
        //判断程序对象上面是否设置了a_Color值，如果有，就设置颜色缓冲区
        if(program.a_Color != undefined){
            initAttributeVariable(gl, program.a_Color, obj.colorBuffer);
        }
 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
 
        //设置模板视图投影矩阵，并赋值给u_MvpMatrix
        g_mvpMatrix.set(viewProjectMatrix);
        g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);
 
        gl.drawElements(gl.TRIANGLES, obj.numIndices, gl.UNSIGNED_BYTE, 0);
    }
    
    function initAttributeVariable(gl, a_attribute, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }
 
    var angle_step = 30;
    var last = +new Date();
    function animate(angle) {
        var now = +new Date();
        var elapsed = now - last;
        last = now;
        var newAngle = angle + (angle_step*elapsed)/1000.0;
        return newAngle%360;
    }
 
    function initFramebufferObject(gl) {
        var framebuffer, texture, depthBuffer;
 
        //定义错误函数
        function error() {
            if(framebuffer) gl.deleteFramebuffer(framebuffer);
            if(texture) gl.deleteFramebuffer(texture);
            if(depthBuffer) gl.deleteFramebuffer(depthBuffer);
            return null;
        }
 
        //创建帧缓冲区对象
        framebuffer = gl.createFramebuffer();
        if(!framebuffer){
            console.log("无法创建帧缓冲区对象");
            return error();
        }
 
        //创建纹理对象并设置其尺寸和参数
        texture = gl.createTexture();
        if(!texture){
            console.log("无法创建纹理对象");
            return error();
        }
 
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offset_width, offset_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        framebuffer.texture = texture;//将纹理对象存入framebuffer
 
        //创建渲染缓冲区对象并设置其尺寸和参数
        depthBuffer = gl.createRenderbuffer();
        if(!depthBuffer){
            console.log("无法创建渲染缓冲区对象");
            return error();
        }
 
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, offset_width, offset_height);
 
        //将纹理和渲染缓冲区对象关联到帧缓冲区对象上
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER,depthBuffer);
 
        //检查帧缓冲区对象是否被正确设置
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(gl.FRAMEBUFFER_COMPLETE !== e){
            console.log("渲染缓冲区设置错误"+e.toString());
            return error();
        }
 
        //取消当前的focus对象
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
 
        return framebuffer;
    }
 
    function initVertexBuffersForPlane(gl) {
 
        // 顶点的坐标
        var vertices = new Float32Array([
            3.0, -1, 3.0, -3.0, -1, 3.0, -3.0, -1, -3.0, 3.0, -1, -3.0    // v0-v1-v2-v3
        ]);
 
        // 颜色的坐标
        var colors = new Float32Array([
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
        ]);
 
        // 顶点的索引
        var indices = new Uint8Array([0, 1, 2,   0, 2, 3]);
 
        //将顶点的信息写入缓冲区对象
        var obj = {};
        obj.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
        obj.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
        obj.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
        if(!obj.vertexBuffer || !obj.colorBuffer || !obj.indexBuffer) return null;
 
        obj.numIndices = indices.length;
 
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
 
        return obj;
    }
 
    function initVertexBuffersForTriangle(gl) {
        // Create a triangle
        // 顶点的坐标
        var vertices = new Float32Array([-0.8, 3.5, 0.0, 0.8, 3.5, 0.0, 0.0, 3.5, 1.8]);
        // 颜色的坐标
        var colors = new Float32Array([1.0, 0.5, 0.3, 1.0, 0.5, 0.3, 1.0, 1.0, 0.3]);
        // 顶点的索引
        var indices = new Uint8Array([0, 1, 2]);
 
        //创建一个对象保存数据
        var obj = {};
 
        //将顶点信息写入缓冲区对象
        obj.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
        obj.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
        obj.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
        if(!obj.vertexBuffer || !obj.colorBuffer || !obj.indexBuffer) return null;
 
        obj.numIndices = indices.length;
 
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
 
        return obj;
    }
 
    function initArrayBufferForLaterUse(gl, data, num, type) {
        var buffer = gl.createBuffer();
        if(!buffer){
            console.log("无法创建缓冲区对象");
            return null;
        }
 
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
 
        buffer.num = num;
        buffer.type = type;
 
        return buffer;
    }
 
    function initElementArrayBufferForLaterUse(gl, data, type) {
        var buffer = gl.createBuffer();
        if(!buffer){
            console.log("无法创建着色器");
            return null;
        }
 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
 
        buffer.type = type;
 
        return buffer;
    }