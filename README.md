# Server for Simple Location Project

**Works on this project are in progress! Do not clone it, until this message is removed or until you're ready to finish it yourself. At this point it is pretty unusable at all! It isn't even translated to English yet. See [Issues](https://github.com/trejder/slp-server/issues) for details and progress. Even, if these issues will be finally resolved, this project is about to be abandoned. See extended explanation in the end of this document.**

This is a server for my Simple Location Project, written in pure PHP and using MySQL database.

## Usage

1. Get the newest version of the source code:
    - clone this repository locally,
    - [download](https://github.com/trejder/slp-server/archive/master.zip) `master` branch as `.zip` file.
2. Create `imei.list` and fill it with data matching your mobile devices (separate with `#`):

        465a3eb892425574#Some Mobile's UUID
        3D0AD03B-8B46-431A-BEF5-FF01B96BA990#Ripple Emulator

3. Create `config.inc` file (added to `.gitignore` by default) and fill it with DB data:
 
        <?php 
            $dbhost = 'localhost';
            $dbname = 'slp_server';
            $dbuser = 'slp_server';
            $dbpass = 'aMIGHTYp@ssword&';
        ?>

4. Upload modified code to sever, capable of running both PHP and MySQL.
5. Create database structure, using `schema.sql` file, and enjoy server running.

Build [client for this project](https://github.com/trejder/slp-client) and install it on at least one mobile device.

## Aditional info

Note, that this project originated, when I was playing with GSM-based real GPS locators. I finally moved toward mobile devices (project's [client](https://github.com/trejder/slp-client) is written in PhoneGap, so can be compiled and installed to a various number of platforms, including Android, iOS and Windows), but core server code remained unchanged. That's why you'll find traces of code or file names referring _IMEI_ number. You may safely ignore this. At this point, both client and server are using mobile device's _UUID_ **only**, even if it is still named _IMEI_ or something like that.

I have found out, that _Ripple Emulator_ uses `3D0AD03B-8B46-431A-BEF5-FF01B96BA990` as _UUID_. Though, I'm not sure, if this is _general_ setting or specific for just my computer. Anyway, I'm using following SQL query: `DELETE FROM 'geo' WHERE 'imei' LIKE '%3D0AD03B-8B46-43%';` to purge database out of entries reported by Ripple Emulator during local tests of [projects' client](https://github.com/trejder/slp-client).

## Tests

Server for Simple Location Project has been tested on all major browsers (including Chrome, Firefox, Internet Explorer and Opera) in their newest versions. Except for the fact, that it is awfully slow and very poorly written (see below notice), everything seems fine.

Since server is written in pure PHP and uses Javascript only for stats calculation and map drawing, it should run in virtually every browser and version out of modern ones.

## Project is nearly abandoned

Upon finishing last touches (see [Issues](https://github.com/trejder/slp-server/issues) for details), this project will most likely be abandoned.

It lacks some certain functionality and has some smaller or bigger bugs:

1. There is completely no support for user credentials / logging in. [Client](https://github.com/trejder/slp-client), once started, throws all the location data directly to server, which distinguishes clients by analysing UUID only.

2. Filtering methods on server side are very poor, causing an enormous amount of data being pushed back to the browser and resulting in timeouts or server resources being exhausted on quite large tracks (few thousands of points / seconds).

3. There is absolutely no data preparation done at server side. All points and entire dataset is pushed to browser and all the track drawing or stats calculating routines are made there, using Javascript. This causes entire solution to be awfully slow.

Unfortunately, all these nasty things are placed so deeply in core code of both server and client, that to fix it, entire project would actually have to be rewritten from scratch. That is, why you should treat this project just as a toy, a funny experiment or an introduction to writing your own solution. You shouldn't **absolutely** use it in production environment or for any kind of serious location or tracking issues.
