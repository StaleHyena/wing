# Wing
Wing is a tool made to facilitate teaching math to a large number of people.
It leverages realtime visualizations of mathematical expressions to explain complex
relationships between variables, and tries to maintain cross-plataform compatibility
by relying only on web technologies for deployment.

## Architecture
Wing serves two distinct webpages through its server, one for the "admin",
and one for the "client". There can be multiple clients, but only one admin is to
control the Wing instance.
In practice, the admin is the teacher and the clients are the students.

## Installation
### Prerequisites
* Being on Linux(or WSL)
* Node.js
* Npm (node package manager)
### Setup
In order to install Wing on your machine, run the following commands:
```bash
$ git clone https://github.com/StaleHyena/wing.git
$ cd wing/
$ npm install
$ npm run build
```
### Configuration
Wing tries to read settings from ``config.json``, and if it cannot find it, it reccurs to ``default-config.json``.
So, you may create yours by running:
```bash
$ cp default-config.json config.json
```
From there, you may edit it on the text editor of your choice, and choose the port the server will attempt to run on.
## Running the server
Having finished the installation process sucessfully, you should be able to start the server by running:
```bash
$ npm run start
```
While in the Wing folder.<br/>
If everything works as intended, you should see something similar to this:
<img src="https://github.com/StaleHyena/wing/blob/readme-dev/assets/server_start.gif" width="150" height="23"><br/>

## Usage
Once the server is started, Wing can be accessed through three different URLs:<br/>

URL | Page
--- | ---
_example.com:port_/admin/ | Admin page
_example.com:port_/client/ | Client page
_example.com:port_ | Redirect to client page<br/>

The default configuration uses port 80, which lets you omit the port number from the url in most web browsers.<br/>

**Note:** Wing currently supports only one admin, who is the first browser that connected to the Admin page.
### Admin
You have:<br/>
* A play/pause button for the autoscroller
* A velocity slider for the autoscroller
* A dropdown menu to select the demo to be displayed for the clients
* Another dropdown menu with function presets
* A textbox for manual control over the function which defines that graph
* A client counter
### Client
Everything that appears on your screen is defined by the function and the demo the admin has chosen.
## FAQ
#### Nice code and all, but what the hell does "Wing" mean?
* It means _Wing is not GeoGebra_, which is another piece of really good software for usecases somewhat similar to the ones Wing is meant for, but it has no **cool networking**.
#### Why is this FAQ so short?
* Because so far we've had very few users and therefore very few questions.
