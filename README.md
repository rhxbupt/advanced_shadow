# advanced_shadow
Implementation of different shadow technologies


`By Haoxu Ren (hren3)`

## Description
Why choose this project, that’s because I am pretty interested in advanced shadow technologies when our team prepared the reading part about shadow. Basically, there are multiple methods to implement a shadow in Computer Graphics field. 
These technologies including: 
Ray tracing
Planar Shadow
Shadow Mapping
Shadow Volume
In all these different kinds of shadow technologies, Shadow Mapping is the most popular one and also the most important one. Compared with shadow volumes, geometrically-based of shadow volumes causes high number of calculations, but shadow mapping is not. That’s make more and more people liked this method.

During my project, I will implement some different ways of shadow mapping, including basic hard shadow, Soft Shadow with PCF algorithms(Percentage closer Filtering), Soft Shadow with PCSS(Percentage-Closer Soft Shadows), and I will also implement 2 different ways of sampling pixel, which included: Poisson sampling and regular sampling. What’s more, my project also support different sample areas, including 16, 32 and 64. In additional, all objects in the scene can span and so that we can compare the performance of different algorithms.


Part1: Render a  scene without shadow
The first part is to render a scene we used in this project, this scene should include: A white plane as a receiver of shadow, An object as an occluders to cast shadow. And of course a light, in my project, I assume all the light are point light so that we are not going to consider area light problem or directional light problem.
The screen shot is shown as follows:



Part 2: The Hard Shadow Part:

After rendering the scene successfully, we focused on implementing the hard shadow firstly. Basically, hard shadow is a little bit “unreal”, because it can not avoid the aliasing problem. But hard shadow is pretty easy to implement, if you don’t have too much requirements of shadow quality, this should be a good method for you.


Part 3: Implement the Soft Shadow with PCF algorithm
PCF is a very important algorithm in the computer graphics field, this algorithm usually used for anti-aliasing, the idea of this algorithm is not hard, basically it just average all pixels’ color instead of just sample only one pixel, in this way, a black color will be changed to a grey color, as a result, for user side it will be looked like much more actual.


From the above, we can see after PCF, the result of shadow is pretty good, but that’s not enough, we will introduce a PCSS algorithm, which is amazing !
Part 4:Implement PCSS
PCSS(Percentage-Closer Soft Shadows) firstly created by Nvidia, and be published at their paper, after this algorithm comes out, I need to say it makes the whole world changed.  PCSS is a complex algorithm, I will introduce it in my presentation.
Here is the result image:


## Directions
For running this demo, you just need to open the index.html file, and you can see this scene in your browser, recommend for Google Chrome.
And defaultly, it will render the shadow by default configuration, which is  hard shadow, you will see some radio button on the bottom of the website,like the following shows:

User can choose different opinions in this control panel, and see the difference of generated shadow.
## Claims
1.Added the control panel of shadow opinion
2.Added the extra objects in the scene
3.Make the object spin and check the shadow result
4. Added mouse control to change the position of light.
## My Assets
During my project, I used an external math library of matrix and an external library of Webgl, it includes some basic operation of webgl.
I listed these as follows:


