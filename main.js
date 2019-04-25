    var canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 800;
 
  
    var Hardshadow = true;
    var pcf = false;
    var pcss = false;


    var sample_16 =true;
    var sample_32 =false;
    var sample_64 =false;

    var poisson = false;
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
        vec4 pack (float depth) {
            // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
            const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
            const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
            // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
            vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
            rgbaDepth -= rgbaDepth.gbaa * bitMask; // Cut off the value which do not fit in 8 bits
            return rgbaDepth;
        }
        void main(){
            //vec4( 0.0, 0.0, 0.0, gl_FragCoord.z);
           gl_FragColor = pack(gl_FragCoord.z); //将灯源视点下的每个顶点的深度值存入绘制的颜色内
           
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
    var Shader_Normal = `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform bool hardshadow;
        uniform bool pcf;
        uniform bool pcss;
        uniform bool poisson;

        uniform bool sample_16;
        uniform bool sample_32;
        uniform bool sample_64;
        uniform sampler2D u_shadowMap;                                                  //纹理的存储变量
        varying vec4 v_PositionFromLight;                                               //从顶点着色器传过来的基于光源的顶点坐标
        varying vec4 v_Color;//顶点的颜色

        

        float unpack(const in vec4 rgbaDepth) {
            const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
            return dot(rgbaDepth, bitShift);
        }

        float findblocker(vec3 shadowCoord, sampler2D shadowMap, float lightsize){
            vec2 poissonDisk[16];
            poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
            poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
            poissonDisk[2] = vec2( -0.094184101, -0.92938870);
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

            
            
            float Near = 1.0;
            float blocker = 0.0;
            float sumBlocker = 0.0;
            float searchWidth = (lightsize * (shadowCoord.z - Near) / shadowCoord.z); 
            vec4 rgbaDepth;
            for(int i =0; i< 16; i++){
                vec4 depth = texture2D(shadowMap, shadowCoord.xy + poissonDisk[i]*searchWidth);
                float tempdepth = unpack(depth);
                if(tempdepth + 0.005 < shadowCoord.z){
                    sumBlocker += tempdepth;
                    blocker += 1.0;
                }

            }
            
            if(blocker > 0.0){
                return sumBlocker/blocker;
            }
            
            return -1.0;
        }

        void main(){

            vec2 poissonDisk_16[16];
            poissonDisk_16[0] = vec2( -0.94201624, -0.39906216 );
            poissonDisk_16[1] = vec2( 0.94558609, -0.76890725 );
            poissonDisk_16[2] = vec2( -0.094184101, -0.92938870);
            poissonDisk_16[3] = vec2( 0.34495938, 0.29387760 );
            poissonDisk_16[4] = vec2( -0.91588581, 0.45771432 );
            poissonDisk_16[5] = vec2( -0.81544232, -0.87912464 );
            poissonDisk_16[6] = vec2( -0.38277543, 0.27676845 );
            poissonDisk_16[7] = vec2( 0.97484398, 0.75648379 );
            poissonDisk_16[8] = vec2( 0.44323325, -0.97511554 );
            poissonDisk_16[9] = vec2( 0.53742981, -0.47373420 );
            poissonDisk_16[10] = vec2( -0.26496911, -0.41893023 );
            poissonDisk_16[11] = vec2( 0.79197514, 0.19090188 );
            poissonDisk_16[12] = vec2( -0.24188840, 0.99706507 );
            poissonDisk_16[13] = vec2( -0.81409955, 0.91437590 );
            poissonDisk_16[14] = vec2( 0.19984126, 0.78641367 );
            poissonDisk_16[15] = vec2( 0.14383161, -0.14100790 );

            vec2 poissonDisk_32[32];
            poissonDisk_32[0] = vec2( 0.0617981, 0.07294159 );
            poissonDisk_32[1] = vec2( 0.6470215, 0.7474022 );
            poissonDisk_32[2] = vec2( -0.5987766, -0.7512833);
            poissonDisk_32[3] = vec2( -0.693034, 0.6913887 );
            poissonDisk_32[4] = vec2( 0.6987045, -0.6843052);
            poissonDisk_32[5] = vec2( -0.9402866, 0.04474335 );
            poissonDisk_32[6] = vec2( 0.8934509, 0.07369385 );
            poissonDisk_32[7] = vec2( 0.1592735, -0.9686295 );
            poissonDisk_32[8] = vec2( -0.05664673, 0.995282 );
            poissonDisk_32[9] = vec2( -0.1203411, -0.1301079 );
            poissonDisk_32[10] = vec2( 0.1741608, -0.1682285 );
            poissonDisk_32[11] = vec2( -0.09369049, 0.3196758 );
            poissonDisk_32[12] = vec2( 0.185363, 0.3213367 );
            poissonDisk_32[13] = vec2( -0.1493771, -0.3147511);
            poissonDisk_32[14] = vec2( 0.4452095, 0.2580113 );
            poissonDisk_32[15] = vec2( -0.1080467, -0.5329178);
            poissonDisk_32[16] = vec2( 0.1604507, 0.5460774 );
            poissonDisk_32[17] = vec2( -0.4037193, -0.2611179 );
            poissonDisk_32[18] = vec2( 0.5947998, -0.2146744);
            poissonDisk_32[19] = vec2( 0.3276062, 0.9244621 );
            poissonDisk_32[20] = vec2( -0.6518704, -0.2503952);
            poissonDisk_32[21] = vec2( -0.3580975, 0.2806469 );
            poissonDisk_32[22] = vec2( 0.8587891, 0.4838005 );
            poissonDisk_32[23] = vec2( -0.1596546, -0.8791054 );
            poissonDisk_32[24] = vec2( -0.3096867, 0.5588146 );
            poissonDisk_32[25] = vec2( -0.5128918, 0.1448544 );
            poissonDisk_32[26] = vec2( 0.8581337, -0.424046 );
            poissonDisk_32[27] = vec2( 0.1562584, -0.5610626 );
            poissonDisk_32[28] = vec2( -0.7647934, 0.2709858 );
            poissonDisk_32[29] = vec2( -0.3090832, 0.9020988);
            poissonDisk_32[30] = vec2( 0.3935608, 0.4609676 );
            poissonDisk_32[31] = vec2( 0.3929337, -0.5010948);
            


            vec2 poissonDisk_64[64];
            poissonDisk_64[0] = vec2( 0.0617981, 0.07294159 );
            poissonDisk_64[1] = vec2( 0.6470215, 0.7474022 );
            poissonDisk_64[2] = vec2( -0.5987766, -0.7512833);
            poissonDisk_64[3] = vec2( -0.693034, 0.6913887 );
            poissonDisk_64[4] = vec2( 0.6987045, -0.6843052);
            poissonDisk_64[5] = vec2( -0.9402866, 0.04474335 );
            poissonDisk_64[6] = vec2( 0.8934509, 0.07369385 );
            poissonDisk_64[7] = vec2( 0.1592735, -0.9686295 );
            poissonDisk_64[8] = vec2( -0.05664673, 0.995282 );
            poissonDisk_64[9] = vec2( -0.1203411, -0.1301079 );
            poissonDisk_64[10] = vec2( 0.1741608, -0.1682285 );
            poissonDisk_64[11] = vec2( -0.09369049, 0.3196758 );
            poissonDisk_64[12] = vec2( 0.185363, 0.3213367 );
            poissonDisk_64[13] = vec2( -0.1493771, -0.3147511);
            poissonDisk_64[14] = vec2( 0.4452095, 0.2580113 );
            poissonDisk_64[15] = vec2( -0.1080467, -0.5329178);
            poissonDisk_64[16] = vec2( 0.1604507, 0.5460774 );
            poissonDisk_64[17] = vec2( -0.4037193, -0.2611179 );
            poissonDisk_64[18] = vec2( 0.5947998, -0.2146744);
            poissonDisk_64[19] = vec2( 0.3276062, 0.9244621 );
            poissonDisk_64[20] = vec2( -0.6518704, -0.2503952);
            poissonDisk_64[21] = vec2( -0.3580975, 0.2806469 );
            poissonDisk_64[22] = vec2( 0.8587891, 0.4838005 );
            poissonDisk_64[23] = vec2( -0.1596546, -0.8791054 );
            poissonDisk_64[24] = vec2( -0.3096867, 0.5588146 );
            poissonDisk_64[25] = vec2( -0.5128918, 0.1448544 );
            poissonDisk_64[26] = vec2( 0.8581337, -0.424046 );
            poissonDisk_64[27] = vec2( 0.1562584, -0.5610626 );
            poissonDisk_64[28] = vec2( -0.7647934, 0.2709858 );
            poissonDisk_64[29] = vec2( -0.3090832, 0.9020988);
            poissonDisk_64[30] = vec2( 0.3935608, 0.4609676 );
            poissonDisk_64[31] = vec2( 0.3929337, -0.5010948);
            poissonDisk_64[32] = vec2( -0.8682281, -0.1990303);
            poissonDisk_64[33] = vec2( -0.01973724, 0.6478714);
            poissonDisk_64[34] = vec2( -0.3897587, -0.4665619 );
            poissonDisk_64[35] = vec2( -0.7416366, -0.4377831 );
            poissonDisk_64[36] = vec2( -0.5523247, 0.4272514);
            poissonDisk_64[37] = vec2( -0.5325066, 0.8410385 );
            poissonDisk_64[38] = vec2( 0.3085465, -0.7842533);
            poissonDisk_64[39] = vec2( 0.8400612, -0.200119 );
            poissonDisk_64[40] = vec2( 0.6632416, 0.3067062 );
            poissonDisk_64[41] = vec2( -0.4462856, -0.04265022 );
            poissonDisk_64[42] = vec2( 0.06892014, 0.812484 );
            poissonDisk_64[43] = vec2( 0.5149567, -0.7502338 );
            poissonDisk_64[44] = vec2( 0.6464897, -0.4666451 );
            poissonDisk_64[45] = vec2( -0.159861, 0.1038342 );
            poissonDisk_64[46] = vec2( 0.6455986, 0.04419327 );
            poissonDisk_64[47] = vec2( -0.7445076, 0.5035095);
            poissonDisk_64[48] = vec2( 0.9430245, 0.3139912 );
            poissonDisk_64[49] = vec2( 0.0349884, -0.7968109);
            poissonDisk_64[50] = vec2( -0.9517487, 0.2963554);         
            poissonDisk_64[51] = vec2( -0.7304786, -0.01006928 );
            poissonDisk_64[52] = vec2( -0.5862702, -0.5531025);
            poissonDisk_64[53] = vec2( 0.3029106, 0.09497032 );
            poissonDisk_64[54] = vec2( 0.09025345, -0.3503742);
            poissonDisk_64[55] = vec2( 0.4356628, -0.0710125 );
            poissonDisk_64[56] = vec2( 0.4112572, 0.7500054 );
            poissonDisk_64[57] = vec2( 0.3401214, -0.3047142);
            poissonDisk_64[58] = vec2( -0.2192158, -0.6911137 );
            poissonDisk_64[59] = vec2( -0.4676369, 0.6570358 );
            poissonDisk_64[60] = vec2( 0.6295372, 0.5629555 );
            poissonDisk_64[61] = vec2( 0.1253822, 0.9892166 );
            poissonDisk_64[62] = vec2( -0.1154335, 0.8248222 );
            poissonDisk_64[63] = vec2( -0.4230408, -0.7129914);
           

        vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;

        if(hardshadow && !pcf &&!pcss){
            vec4 rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy);
            float depth = unpack(rgbaDepth);
            float visibility = (shadowCoord.z > depth + 0.005) ? 0.5 : 1.0;
            gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
        }
        else if(pcf && !hardshadow && !pcss){
                  
                float shadows =0.0;
                float opacity=0.5;// 阴影alpha值, 值越小暗度越深
                float texelSize=1.0/512.0;// 阴影像素尺寸,值越小阴影越逼真
               
                vec4 rgbaDepth;
                            
                    if(poisson == false){
                        if(sample_16 && !sample_32 &&!sample_64){
                            for(float y = -2.0; y <=1.0; y+=1.0){
                                for(float x= -2.0; x<=1.0; x+=1.0){
                                    rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*texelSize);
                                    shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
                
                                }
                            }
                            shadows/=16.0;// 4*4的样本
                        }
                        else if(!sample_16 && sample_32 &&!sample_64){
                            for(float y = -3.5; y <=3.5; y+=1.0){
                                for(float x= -2.0; x<=1.0; x+=1.0){
                                    rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*texelSize);
                                    shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
                
                                }
                            }
                            shadows/=32.0;// 4*4的样本
                        }
                        else if(!sample_16 && !sample_32 &&sample_64){
                            for(float y = -3.5; y <=3.5; y+=1.0){
                                for(float x= -3.5; x<=3.5; x+=1.0){
                                    rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*texelSize);
                                    shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
                
                                }
                            }
                            shadows/=64.0;// 4*4的样本
                        }

                    }
                    else if(poisson == true){
                        if(sample_16 && !sample_32 &&!sample_64){
                            for(int i=0; i < 16; i++){
                                rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk_16[i]* texelSize);
                                shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                            
                            }
                            shadows/=16.0;// 4*4的样本
                        }
                        else if(!sample_16 && sample_32 &&!sample_64){
                            for(int i=0; i < 32; i++){
                                rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk_32[i]* texelSize);
                                shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                            
                            }
                            shadows/=32.0;// 4*4的样本
                        }
                        else if(!sample_16 && !sample_32 && sample_64){
                            for(int i=0; i < 64; i++){
                                rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk_64[i]* texelSize);
                                shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                            
                            }
                            shadows/=64.0;// 4*4的样本
                        }
                    }
                    
                
                
                float visibility=min(opacity+(1.0-shadows),1.0);
                gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
            
        }
        else if(pcss && !hardshadow && !pcf){
           
            float lightsize = 1.0/30.0;
            
            // blocker search
            float blockerDistance = findblocker(shadowCoord, u_shadowMap, lightsize);

            if(blockerDistance == -1.0){
                gl_FragColor = vec4(v_Color);           
            }
            else{
                // penumbra estimation
                float temp = (shadowCoord.z - blockerDistance) / blockerDistance;
                float penumbraWidth = temp*lightsize*1.0/shadowCoord.z;
               
                float shadows =0.0;
                float opacity=0.5;// 阴影alpha值, 值越小暗度越深a
                
                vec4 rgbaDepth;
                
                
                if(!poisson){
                    if(sample_16 && !sample_32 &&!sample_64){
                        for(float y = -2.0; y <=1.0; y+=1.0){
                            for(float x= -2.0; x<=1.0; x+=1.0){
                                rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*penumbraWidth);
                                shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
            
                            }
                        }
                        shadows/=16.0;// 4*4的样本
                    }
                    else if(!sample_16 && sample_32 &&!sample_64){
                        for(float y = -3.5; y <=3.5; y+=1.0){
                            for(float x= -2.0; x<=1.0; x+=1.0){
                                rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*penumbraWidth);
                                shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
            
                            }
                        }
                        shadows/=32.0;// 4*4的样本
                    }
                   else if(!sample_16 && !sample_32 && sample_64){
                        for(float y = -3.5; y <=3.5; y+=1.0){
                            for(float x= -3.5; x<=3.5; x+=1.0){
                                rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*penumbraWidth);
                                shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
            
                            }
                        }
                        shadows/=64.0;// 4*4的样本
                    }
                    
                }
                else if(poisson){
                    if(sample_16 && !sample_32 &&!sample_64){
                        for(int i=0; i < 16; i++){
                            rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk_16[i]* penumbraWidth);
                            shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                        
                        }
                        shadows/=16.0;// 4*4的样本
                    }
                    else if(!sample_16 && sample_32 &&!sample_64){
                        for(int i=0; i < 32; i++){
                            rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk_32[i]* penumbraWidth);
                            shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                        
                        }
                        shadows/=32.0;// 4*4的样本
                    }
                    else if(!sample_16 && !sample_32 &&sample_64){
                        for(int i=0; i < 64; i++){
                            rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk_64[i]* penumbraWidth);
                            shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                        
                        }
                        shadows/=64.0;// 4*4的样本
                    }
                }
                
                float visibility = min(opacity+(1.0-shadows),1.0);
                gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);  
            }
        } 
    }  
        `;

    // PCSS
    var Shader_PCSS = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform sampler2D u_shadowMap;//纹理的存储变量
        varying vec4 v_PositionFromLight;//从顶点着色器传过来的基于光源的顶点坐标
        varying vec4 v_Color;//顶点的颜色

        float unpack(vec4 rgbaDepth) {
                    vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
                    return dot(rgbaDepth, bitShift);
                }

        float findblocker(vec3 shadowCoord, sampler2D shadowMap, float lightsize){
            vec2 poissonDisk[16];
            poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
            poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
            poissonDisk[2] = vec2( -0.094184101, -0.92938870);
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
            float Near = 1.1;
            float blocker = 0.0;
            float sumBlocker = 0.0;
            float searchWidth = (lightsize * (shadowCoord.z - Near) / shadowCoord.z); 
            vec4 rgbaDepth;
            for(int i =0; i< 16; i++){
                vec4 depth = texture2D(shadowMap, shadowCoord.xy + poissonDisk[i]*searchWidth);
                float tempdepth = unpack(depth);
                if(tempdepth + 0.005 < shadowCoord.z){
                    sumBlocker += tempdepth;
                    blocker += 1.0;
                }

            }
            
            // for(float y = -3.5; y <=3.5; y+=1.0){
            //       for(float x= -3.5; x<=3.5; x+=1.0){
            //              rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*searchWidth);
            //             if(shadowCoord.z-0.005 > unpack(rgbaDepth)){
            //                             sumBlocker += unpack(rgbaDepth);
            //                             blocker += 1.0;
            //                         }
                
            //                     }
            //                 }
            if(blocker > 0.0){
                return sumBlocker/blocker;
            }
            
            return -1.0;
        }

       
        void main(){
      
        float lightsize = 1.0/20.0;
        vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
        // blocker search
        float blockerDistance = findblocker(shadowCoord, u_shadowMap, lightsize);
		if(blockerDistance == -1.0){
            gl_FragColor = vec4(v_Color);           
        }
        else{
            // penumbra estimation
            float temp = (shadowCoord.z - blockerDistance) / blockerDistance;
            float penumbraWidth = temp*lightsize*1.1/shadowCoord.z;
           
            float shadows =0.0;
            float opacity=0.5;// 阴影alpha值, 值越小暗度越深a
            
            vec4 rgbaDepth;

            for(float y = -3.5; y <=3.5; y+=1.0){
                for(float x= -3.5; x<=3.5; x+=1.0){
                        rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*penumbraWidth);
                        shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
                }
            }
                        
            shadows/=64.0;// 4*4的样本
            
            float visibility = min(opacity+(1.0-shadows),1.0);
            gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
           
        }
    }
        `;


    //implemented the PCF
        
        var Shader_PCF = `
            #ifdef GL_ES
                precision mediump float;
            #endif
            uniform sampler2D u_shadowMap;
            varying vec4 v_PositionFromLight;
            varying vec4 v_Color;

            // depth
            float unpack(const in vec4 rgbaDepth) {
           
            const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
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
                float opacity=0.5;// 阴影alpha值, 值越小暗度越深
                float texelSize=1.0/1024.0;// 阴影像素尺寸,值越小阴影越逼真
               
                vec4 rgbaDepth;
                
                    // for(int i=0; i < 16; i++){
                    //     rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy + poissonDisk[i]* texelSize);
                    //     shadows += shadowCoord.z-0.005 > unpack(rgbaDepth)? 1.0 : 0.0;
                        
                    // }
                    for(float y = -3.5; y <=3.5; y+=1.0){
                        for(float x= -3.5; x<=3.5; x+=1.0){
                            rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*texelSize);
                            shadows += shadowCoord.z-0.005 > unpack(rgbaDepth) ? 1.0 : 0.0;
        
                        }
                    }
                
                shadows/=64.0;// 4*4的样本
                float visibility=min(opacity+(1.0-shadows),1.0);
                gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
            }
        `;

    var fragmentShaderSource_Op  = Shader_Normal;

    function setPoisson(type) {
        if(type == 1){
            poisson = true;
        }
        
        if(type == 2){
            poisson = false;
        }
       
    }

    function setType(type) {
        if(type == 0){
            Hardshadow = true;
            pcss = false;
            pcf = false;
        }
        if(type == 1){
            Hardshadow = false;
            pcss = false;
            pcf = true;
        }
        if(type == 2){
            Hardshadow = false;
            pcss = true;
            pcf = false;
        }
       
    }

    function setSample(type){
        if(type == 0){
            sample_16 = true;
            sample_32 = false;
            sample_64 = false;
        }
        if(type == 1){
            sample_16 = false;
            sample_32 = true;
            sample_64 = false;
        }
        if(type == 2){
            sample_16 = false;
            sample_32 = false;
            sample_64 = true;
        }
    }
    //生成的纹理的分辨率，纹理必须是标准的尺寸 256*256 1024*1024  2048*2048
    var resolution = 256;
    var offset_width = resolution;
    var offset_height = resolution;
 
    //灯光的位置
    var light_x = -1.0;
    var light_y = 7.0;
    var light_z = 1.0;
 
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
 

       // document.addEventListener('keydown', onKeyDown, false);

        //初始化正常绘制着色器，获取到程序对象并获取相关变量的存储位置
        var normalProgram = createProgram(gl, vertexShaderSource, Shader_Normal);
        
        normalProgram.a_Position = gl.getAttribLocation(normalProgram, "a_Position");
        normalProgram.a_Color = gl.getAttribLocation(normalProgram, "a_Color");
        normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, "u_MvpMatrix");
        normalProgram.u_MvpMatrixFromLight = gl.getUniformLocation(normalProgram, "u_MvpMatrixFromLight");
        normalProgram.u_ShadowMap = gl.getUniformLocation(normalProgram, "u_shadowMap");
        normalProgram.Hardshadow = gl.getUniformLocation(normalProgram,"hardshadow");
        normalProgram.Pcf = gl.getUniformLocation(normalProgram,"pcf");
        normalProgram.Pcss = gl.getUniformLocation(normalProgram,"pcss");
        normalProgram.poisson = gl.getUniformLocation(normalProgram,"poisson");
        normalProgram.sample_16 = gl.getUniformLocation(normalProgram,"sample_16");
        normalProgram.sample_32 = gl.getUniformLocation(normalProgram,"sample_32");
        normalProgram.sample_64 = gl.getUniformLocation(normalProgram,"sample_64");
        if(normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || !normalProgram.u_MvpMatrix || !normalProgram.u_MvpMatrixFromLight || !normalProgram.u_ShadowMap){
            console.log("无法获取到正常绘制着色器的相关变量");
            return;
        }
 
        //设置相关数据，并存入缓冲区内
        var triangle = initVertexBuffersForTriangle(gl);
        var plane = initVertexBuffersForPlane(gl);
        var cube = initVertexBuffersForCube(gl);
        if(!triangle || !plane || !cube){
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
        
        var mvpMatrixFromLight_c = new Matrix4();
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
 
            drawCube(gl, shadowProgram,cube,currentAngle, viewProjectMatrixFromLight);
            mvpMatrixFromLight_c.set(g_mvpMatrix);

            //解除帧缓冲区的绑定，绘制正常颜色缓冲区
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
            //切换为正常的程序对象并绘制
            gl.useProgram(normalProgram);
            gl.uniform1i(normalProgram.Hardshadow, Hardshadow);
            gl.uniform1i(normalProgram.Pcf, pcf);
            gl.uniform1i(normalProgram.Pcss, pcss);

            gl.uniform1i(normalProgram.poisson, poisson);
            gl.uniform1i(normalProgram.sample_16, sample_16);
            gl.uniform1i(normalProgram.sample_32, sample_32);
            gl.uniform1i(normalProgram.sample_64, sample_64);
            gl.uniform1i(normalProgram.u_ShadowMap, 0.0);
 
            
            //绘制三角形和平面（正常绘制的图形）
            gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_t.elements);
            drawTriangle(gl, normalProgram, triangle, currentAngle, viewProjectMatrix);
            
            gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_p.elements);
            drawPlane(gl, normalProgram, plane, viewProjectMatrix);
 
            gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_c.elements);
            drawCube(gl, normalProgram, cube, currentAngle,viewProjectMatrix);

            requestAnimationFrame(tick);
        })();
    }
 
    //声明坐标转换矩阵
    var g_modelMatrix = new Matrix4();
    var g_mvpMatrix = new Matrix4();
 
    function drawTriangle(gl,program,triangle,angle,viewProjectMatrix) {
        //设置三角形图形的旋转角度，并绘制图形
        g_modelMatrix.setRotate(0, 0.0, -1.0, 0.0);
        draw(gl, program, triangle, viewProjectMatrix);
    }
 
    function drawPlane(gl, program, plane, viewProjectMatrix) {
        //设置平面图形的旋转角度并绘制
        g_modelMatrix.setRotate(0, 0.0, 1.0, 1.0);
        draw(gl, program, plane, viewProjectMatrix);
    
    }
    
    function drawCube(gl,program,cube,angle,viewProjectMatrix){
        g_modelMatrix.setRotate(0, 0.0, 1.0, 0.2);
        draw(gl, program, cube, viewProjectMatrix);
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
            5.0, -1, 5.0, -5.0, -1, 5.0, -5.0, -1, -5.0, 5.0, -1, -5.0    // v0-v1-v2-v3
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
        var vertices = new Float32Array([-0.8, 2.5, 0.0, 0.8, 2.5, 0.0, 0.0, 2.5, 1.8]);
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

    function initVertexBuffersForCube(gl){
        var vertices = new Float32Array([
            // 设置顶点
            4.0,  1.0,  2.0,    // v0 White
            3.0,  1.0, 2.0,    // v1 Magenta
            3.0, -1.0,  2.0,   // v2 Red
            4.0, -1.0,  2.0,    // v3 Yellow
            4.0, -1.0, 1.0,    // v4 Green
            4.0,  1.0, 1.0,      // v5 Cyan
            3.0,  1.0, 1.0,     // v6 Blue
            3.0, -1.0, 1.0,     // v7 Black
        ]);      
        var colors = new Float32Array([
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,1.0,  0.0,  0.0,1.0,  0.0,  0.0,1.0,  0.0,  0.0,1.0, 0.0,  0.0
        ]);
        
        var indices = new Uint8Array([
            0, 1, 2,   0, 2, 3,    // 前
            0, 3, 4,   0, 4, 5,    // 右
            0, 5, 6,   0, 6, 1,    // 上
            1, 6, 7,   1, 7, 2,    // 左
            7, 4, 3,   7, 3, 2,    // 下
            4, 7, 6,   4, 6, 5     // 后
        ]);
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

    