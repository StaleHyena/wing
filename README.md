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
* Node.js
* Npm (node package manager)
### Instructions
In order to install wing on your machine, run the following commands:
```bash
$ git clone https://github.com/StaleHyena/wing.git
$ cd wing/
$ npm install
```
## Running the server
Having finished the instalation process sucessfully, you should be able to start the server by running:
``
$ node server.js
``
while in the wing folder.<br/>
That will attempt to start the server on the port specified by the ``config.json`` file (80 by default).<br/>
If everything works as intended, you should see something similar to this:
<img src="https://github.com/StaleHyena/wing/blob/readme-dev/assets/server_start.gif" width="150" height="23"><br/>

## Usage
Once the server is started, wing can be acessed through three different URLs:<br/>

URL | Page
--- | ---
_example.com:port_/admin/ | Admin page
_example.com:port_/client/ | Client page
_example.com:port_ | Redirect to client page<br/>

**Note:** Only one admin is allowed to control things. The true admin is the first person who connected to the Admin page.
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
#### Nice code and all, but, what the hell does "wing" mean?
* It means _wing is not geogebra_, which is another piece of really good software for usecases somewhat similar to the ones wing is meant for, but it has no **cool networking**.
#### Wow! Really cool name, whose idea was it?
* It was a collective idea that we absolutely stole from wine.
#### Why is this FAQ so short?
* Because we've had very few users and therefore very few questions so far.
