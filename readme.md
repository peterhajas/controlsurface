# controlsurface
## A control surface for a spare tablet / phone on your desk

`controlsurface` is a way to have controls on a tablet or phone that you keep on your desk.

The control surface is customizable. You can have any number of controls for toggling settings on your computer, launching apps, interacting with apps, controlling music, and more.

Controls are scripts that are run on your host machine. You can specify any script that you like. Tapping on the corresponding part of the control surface will trigger that script.

### Configuration

`controlsurface` uses a config file in your home directory. You should call it `.controlsurface`.

This file contains two parts:

#### Controls

This is a list specified by the Controls heading. Each element in this list has the following elements:

 - Title - this should be the topmost entry in the control
 - `command` - the command to run. For example, "say hello"
 - `short` - a shortname-version of the Title
 - `type` - the type of control. Currently, only one-off controls (`oneoff`) are supported
 - `keynum` - a key for describing the position and size of the control. See **Layout** for more.

Here's a sample Controls section of a config file:

    Controls:
        - Say Hello:
            command: say hello
            short: hello
            type: oneoff
            keynum: 1
        - Say Goodbye:
            command: say goodbye
            short: goodbye
            type: oneoff
            keynum: 2

#### Layout

Layout is the second section of the config file. It allows you to visually position your controls in a grid. Using ASCII graphics, you can (somewhat) easily move controls around. Here's an example Layout section:

    Layout: >
        0000
        0112
        0002

Some notes about layout:

 - `0` means empty space
 - The layout grid can be however wide and tall you would like. Controls positioned within this grid will be aspect-fitted to fit the screen displaying them.

#### Example

An example config file can be found in `example.controlsurface`.

### Getting Things Going

This has only been tested on OS X. You may need to run `sh prepare.sh` to get dependencies. I'm not super sure.

Once you do that, run it with `node`:

    $ node controlsurface.js

#### A Note on Stability

`controlsurface` is still pretty young. It might delete all your stuff or order you a lot of pizza on accident.

### License

For licensing, see `license.md`.
