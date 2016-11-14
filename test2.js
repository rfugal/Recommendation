javascript:if(!window.jQuery||confirm('Overwrite\x20current\x20version?\x20v'+jQuery.fn.jquery))(function(d,s){s=d.createElement('script');s.src='http://code.jquery.com/jquery.js';(d.head||d.documentElement).appendChild(s)})(document);
javascript:(function(d,s){s=d.createElement('script');s.src='/webapp/underscore.js';(d.head||d.documentElement).appendChild(s)})(document);
function postBook(bookName, book) {
    var email = "rfugal@gmail.com";
    $.ajax({
        url: "/webapp/addLibrary.php",
        data: {
            'email' : email,
            'bookName' : bookName,
            'bookJson' : JSON.stringify(book)
        },
        type: "POST",
        dataType: "xml"
    });
};
var text = document.getElementById('mw-content-text').innerText.toLowerCase().replace(/[^A-z']/g, ' ').replace("[", " ").replace("]", " ").match(/\b[A-z']+/gi);
var words = _.countBy(text, function(word) {
    return word;
});
delete words['then'];
book = {
    link: window.location.href.replace("http://sara.ai/webapp/simplewikipedia","https://simple.wikipedia.org/wiki").replace(".html",""),
    title: document.getElementById('firstHeading').innerText,
    author: "Wikipedia",
    year: "2016",
    publisher: "",
    words: words
};
postBook(book.title, book);