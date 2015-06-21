## Currencies Calculator

### Background
From time to time I need to see how much would cost something i.e. on Amazon in my local currency, but I didn't find anything simple enough or written with good usability or on web page without hundreds of tracking software... and so on. To summarize - I wasn't happy with what was available and I decided to put together something really simple but getting the job done.

### Techs
I decided to use [**AngularJS**](https://angularjs.org/), but as I needed to get current currencies values from NBP (Poland National Bank) every day, I soon stumbled upon CORS restrictions, and no wonder. That is why I decided to use simple proxy written in **PHP** (`proxy.php`), which gets data in **XML** format an returns for Angular app. Connection between Angular and PHP proxy is secured against **CSRF** and uses very simple implementation of cache, so number of request will be minimized to one per day.

In order to make all of this nice for an eye and responsive for mobile devices I used [**Foundation 5 by Zurb**](http://foundation.zurb.com/) framework.

All dependencies are installed with **Bower** with `bower install`.

### Example XML from bank
I'm sure you dreamed to see it... ;)
```xml
<?xml version="1.0" encoding="ISO-8859-2"?>
<tabela_kursow typ="A" uid="15a117">
  <numer_tabeli>117/A/NBP/2015</numer_tabeli>
  <data_publikacji>2015-06-19</data_publikacji>
  <pozycja>
    <nazwa_waluty>bat (Tajlandia)</nazwa_waluty>
    <przelicznik>1</przelicznik>
    <kod_waluty>THB</kod_waluty>
    <kurs_sredni>0,1095</kurs_sredni>
  </pozycja>
</tabela_kursow>
```