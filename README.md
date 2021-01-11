## Currencies Calculator

[![Code Climate](https://codeclimate.com/github/wasilak/currencies-calculator/badges/gpa.svg)](https://codeclimate.com/github/wasilak/currencies-calculator)

### Background
From time to time I need to see how much would cost something i.e. on Amazon in my local currency, but I didn't find anything simple enough or written with good usability or on web page without hundreds of tracking software... and so on. To summarize - I wasn't happy with what was available and I decided to put together something really simple but getting the job done.

### Techs
I decided to use [**AngularJS**](https://angularjs.org/), but as I needed to get current currencies values from NBP (Poland National Bank) every day, I soon stumbled upon CORS restrictions, and no wonder. That is why I decided to write Go application which gets data in **JSON** format an returns for Angular app.

In order to make all of this nice for an eye and responsive for mobile devices I used [**Foundation 5 by Zurb**](http://foundation.zurb.com/) framework.

All dependencies are installed with **Yarn** with `yarn install` and `go build`.

Deployment:
 `rice embed go && go build`
