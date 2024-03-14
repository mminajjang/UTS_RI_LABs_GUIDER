# UTS_RI_LABs_GUIDER
An application utilizing Pepper to guide through UTS Robotics Institute's Labs.
Java script and jQuery used to control robot and its tablet, and HTML and CSS used to deisgn web page.

## Installation
To install this application, follow the procedure : 
   1. Connect the Pepper to your laptop.
   2. Open Choregraphe and configure your robot.
   3. Open the app-launcher project and run `package and install current project to the robot`.

## Customization

### How to edit labs information
   1. Open the `html/js/Lab_Info.js`.
   2. Find each lab title, and update the information. 
      `ROBOTNAME` will be automatically turned to the robot's own name. 

### How to add your project on lab page

   1. If you have an image you would like to display for your project, save the image to the `html/images` directory.
   2. Open the `html/js/projects.json` and edit project name and image url.

   If you do not have a custom image, the default UTS banner will be used.

