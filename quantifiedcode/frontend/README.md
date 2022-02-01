# Getting Up & Running

Here's what you need to do in order to run the code with the official Scanner backend API:

* Check out the code on your machine
* Create and activate a virtual environment (optional): `virtualenv venv` , `source venv/bin/activate`
* Go to the `qc` directory and install the requirements: `pip install -r requirements.txt`
* Install `npm` and install the requirements: `npm install` (in the root directory)
* Run `ENVIRONMENT=development make` to build the assets and store them in the 'build' directory: `make` (in the `qc//frontend` directory).
  This will keep running and update changed files continously.
* Run the Flask HTTP server: `python app.py`

You should now be able to retrieve data from the Scanner backend API, 
while using your own local version of the frontend.

## Design Guidelines

This is a short list of guidelines and architecture concepts that we use to build our frontend.

### Stick to the Backend URL Schema

In general, the frontend should follow the URL schema of the backend whenever possible. This means
that the frontend URL for a given resource should ideally be equivalent to the URL of the backend
URL that is used to retrieve this resource.

### Avoid State Whenever Possible

State, in the sense of internal application data not contained within the URL, is our enemy. Avoid
it whenever you can and store the parameters you need to display a certain view in the URL instead.

This has several advantages:

* It works out-of-the-box with the browser history and allows navigating back and forth without
  having to deal manually with history.pushState.
* It allows sharing of URLs with other people (which is not possible when all state information is
  contained in some internal variable)
* It makes application logic very easy: Whenever the URL is changed, the application passes all
  parameters to the component hierarchy. Each component decides itself if it has to rerender or 
  not and updates its state accordingly.

#### Handling property changes

When a user clicks on a link and changes the URL, new properties will get passed to all components
in the application. You should handle such property changes through the following two methods: 

* `componentDidMount` : Perform initial setup of the component. The properties will be accessible
  through the component's `this.props` variable
* `componentWillReceiveProps`: This method gets called when a **mounted** component receives new
  properties, which are passed in as the first parameter to the method call.

### Use Caching to Speed Up Things

The frontend communicates with the backend through an API interface. Each API call uses the
`Utils.apiRequest` method, which provides authentication, caching and bundling of request calls.
Please make sure you understand these aspects before using API calls or writing your own.

* Authentication: Unless you specify the `authenticated : false` option, all API requests will
  use the authentication token to authorize access. The token is generated when logging in and
  kept in local storage. It is accessible through the `Utils.accessToken()` method. If no access
  token is set, this function will return an empty string (`''`).
* Caching: Unless `cached: false` is set, all requests will be cached. There are several levels of
  caching (the cache only affects GET, but never POST / DELETE / PUT requests). 

####Cache Internals

The cache uses the local storage to keep the content of GET requests. It works as follows:

* First, if a given URL has been requested less than `settings.cacheRefreshLimit` seconds ago, it will not be requested
again. The method will instead return the cached value. 
* Otherwise, two things will happen: if there is a cached value for the given URL, it will get returned immediately. At the same time, a request will be created and the resource will be fetched from the server. 
* After receiving the response, the cache algorithm checks if it is identical with the cached value that has been returned earlier. 
* If this is the case, nothing will happen. Otherwise, the new, updated value will be returned and stored in the cache for future use.

Cached values expire after `settings.cacheValidity` seconds. Caching can be disabled globally by
setting `settings.useCache : false`.

To further reduce bandwidth, `ETag` headers are used by the API server to determine if a given
response has changed compared to an earlier version. If this is not the case, the response will not
be returned again, thereby saving bandwidth and speeding up requests.

#### Bundling of Requests

In addition to caching, the `utils.apiRequest` method makes sure that the same resource is not
requested more than once simultaneously (which can happen if multiple components request information
about the same project or user). Each pending request will be stored in a hash table. When another
part of the program requests the same resource, the provided callbacks simply get attached to the
pending request and served as soon as it terminates.

This bundling allows individual components to require all resources they need without having to
worry about caching or requesting the same resource more than once. This makes it unneccessary to
centralize resource access and allows for more modular, less interdepent code.

### Avoid Calling Higher-Level Components

If possible, do not pass information from lower-level components to higher-level components (e.g.
by calling methods from a higher-level class that are passed into the properties of a lower-level class).
The preferred way to deal with change is to redirect to a new URL, with a new set of properties that
are passed down the hierarchy of components.

### Naming Conventions

We adhere to the Javascript naming conventions whenever possible. This means:

* **functions** and **variables**: `lowerCamelCase`
* **classes**: `UpperCamelCase`
* **React components**: Use `[SomeName]Component` whenever adequate

Data from the API will be in `lower_underscore` notation. Leave it as is when dealing directly with
the data. When storing it into Javascript variables, convert to JS notation.

### Directories

* React components go into `components` folder. Each component should be in the sub folder that
  corresponds to the resource it primarily deals with.
* API methods should be in the `api` folder and mirror the structure of the backend API whenever
  possible.
* `helpers` contains functions and classes that are used by different components and which are
   too extensive to be contained in `utils` (e.g. issues-related functionality).
* `utils` contains helper functions to deal with lower-level handling of API requests, localStorage,
  URL generation and generation of checksums (among other things).
* `assets` contains CSS and JS files that are not provided through a package manager (e.g. Bower)

### Tests

Currently, the frontend has a suite of automated webdriver tests that you can run. To do this,
either use `py.test` or the `unittest` module.

```bash
#Run from within the `webapp` directory
ENVIRONMENT=test python -m unittest discover frontend/tests -t ..
#...or using py.test
ENVIRONMENT=test py.test frontend/tests
```

You will also have to start the webserver with the same environment setting:

```bash
#within the  directory:
ENVIRONMENT=test python /app.py
```

Make sure that all the tests pass locally before making a pull request. In any case our CI server
will run the tests and discover if something is amiss, so better do it yourself ;)