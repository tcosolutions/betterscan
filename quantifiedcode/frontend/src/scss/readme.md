(S)CSS coding standards
=======================

Folder structure
----------------

* SCSS files shall stored in the following folder structure.
* To improve page loading time, an above-the-fold and a below-the-fold file has to be maintained

```
scss/
|
|-- modules/				# Common modules
|   |-- _variables.scss  		# Variables
|   |-- _colors.scss 			# Color definitions
|   |-- _functions.scss 		# Functions
|   |-- _spaces.scss     # Margin generation
|   |-- ...                 		# etc.
|
|-- partials/ 				# Partials
|   |-- screens/         # Screen styles
|       |-- _organization.scss            # Organization screen styles
|       |-- _project_details.scss            # Project details screen styles
|       |-- _project_list_free.scss            # Github Project List
|       |-- ...             # etc.
|   |-- _breadcrumb.scss     		# Breadcrumbs
|   |-- _footer.scss    		# Footer
|   |-- _modals.scss       		# Modals
|   |-- _typography.scss  		# Typography
|   |-- ...       			# etc.
|
|	...	
|
-- _atf.scss				# Above-the-fold CSS (ATF)
-- _btf.scss				# Below-the-fold CSS (BTF)
-- main.scss				# Primary SCSS file (ATF + BTF)
```
More details: http://thesassway.com/beginner/how-to-structure-a-sass-project

Content structure
-----------------

* In each file, S(C)SS attributes shall be arranged in the following groups and in the following order
* Each block should start with a comment, stating the name of the group (e.g., '// Visual formatting')
* All items that do not belong in any of the first three groups go into the group 'Other'. 
* Items in the group 'Other' should not be listed in random order, but should also be grouped according to  [W3C's](http://www.w3.org/wiki/CSS/Properties) CSS property groups.

### (S)CSS groups and order
1. [Visual formatting](http://www.w3.org/wiki/CSS/Properties#Visual_formatting)
2. Box model
	1. [Box size](http://www.w3.org/wiki/CSS/Properties#Box_Size)
	2. [Margin + padding](http://www.w3.org/wiki/CSS/Properties#Margin_.26_Padding)
3. Typography + color
	1. [Text](http://www.w3.org/wiki/CSS/Properties#Text)
	2. [Font](http://www.w3.org/wiki/CSS/Properties#Font)
	3. [Color](http://www.w3.org/wiki/CSS/Properties#Color)
4. Other

### Example
```
div.show {
  // Visual formatting
  display:block;
  position:relative;  

  // Box model
  width:100%;
  margin:0;
  padding:2px;

  // Typography + color
  font-size:14px;
  font-weight:lighter;
  text-decoration:none;
  color:#777;

  // Other
  border: 1px solid #000000;        
  background-color: #999999;        

}
```

Colors usage
------------
* All colors are defined using the hex notation only: #000000 
* Please note that using the rgba notation in SCSS will call a function which can handle also hex codes: rgba(#000000, 0.45) [Learn more] (http://sass-lang.com/documentation/Sass/Script/Functions.html#rgba-instance_method)
* For colors, we use color palettes
* At a minimum every palette defines a base colour, and then optionally adds tones use the following naming pattern:
  * x-dark
  * dark *
  * mid-dark
  * base (default)
  * mid-light
  * light
  * x-light
* Some palettes contain even more tones e.g. the qc palette:
  * ```
    qc: (
        base: $_color-base-white,
        blue: #0079d2,
        blueshadow: #016dbc,
        blue-opaq: rgba(#0079d2, 0.1),
        darkblue: #005197,
        darkerblue: #00396a,
        green: #00ba16,
        darkgreen: #00740e,
        orange: #ee8100,
        darkorange: #ae5e00,
    )
    ```
* More details [here](http://erskinedesign.com/blog/friendlier-colour-names-sass-maps/)

### Example
```
// File _colors.scss 

// SCSS function to retrieve colors
@function palette($palette, $tone: 'base') {
    @return map-get(map-get($palettes, $palette), $tone);
}

// Example for base color variable
$_color-base-grey: rgb(229,231,234);


// Example for color palette definition
$palettes: (
    purple: (
        base:   rgb(42,40,80),
        light:  rgb(51,46,140),
        dark:   rgb(40,38,65)
    ),
    grey: (
        base:  $_color-base-grey,
        light: lighten($_color-base-grey, 10%),
        dark: darken($_color-base-grey, 10%)
    )
);
```
```
// File _buttons.scss
// Set color to light purple and background to (base) grey
.btn {
   color: palette(purple, light);
   background: palette(grey);
}
```

Space usage (Margins)
---------------------
* scss/modules/_spaces.scss generates margin classes which you can use directly in html
* Margin classes are generated in the range from 0 to 150 in 5px steps
* Class naming convention: .space-(top|right|bottom|left)-(x: 0 < x < 150)

### Example

```
<!-- space-top-100 will generate a margin top of 100px -->
<div class="space-top-100"></div>

<!-- space-right-45 will generate a margin right of 45px -->
<div class="space-top-45"></div>
```

Radius usage
------------
* scss/modules/_border-radius.scss generates radius classes which you can use directly in html
* radius-lg classes will add a 5px border radius
* radius-sm classes will add a 2px border radius

### SCSS

```
.top-radius-lg {
  @include border-top-radius($_lg);
}

.bottom-radius-lg {
  @include border-bottom-radius($_lg);
}

.all-radius-lg {
  @include border-radius($_lg);
}

.top-radius-sm {
  @include border-top-radius($_sm);
}

.bottom-radius-sm {
  @include border-bottom-radius($_sm);
}

.all-radius-sm {
  @include border-radius($_sm);
}
```

* We are using mixins to define the radius classes. You can use them also in any other SCSS file:

### Example:

```
textarea {
  margin-bottom: 20px;
  @include border-radius(2px);
}
```