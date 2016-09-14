//Copyright 2016 Sara.AI, Inc. Patent Pending Recognized Word Model to Recommendation
function WordsCtrl($scope) {
    
    
    $scope.Words = {};
    if (window.localStorage.getItem('SaraWordModel') != null) {
        $scope.Words = angular.fromJson(window.localStorage.getItem('SaraWordModel'));
    } else {
        $scope.Words = {
            'this': {RAN:true, encounters:0},
            'is': {RAN:true, encounters:0},
            'sara': {RAN:false, encounters:0},
            'and': {RAN:true, encounters:0},
            'can': {RAN:true, encounters:0},
            'read': {RAN:false, encounters:0},
            'the': {RAN:true, encounters:0},
            'book': {RAN:false, encounters:0},
            'to': {RAN:true, encounters:0},
            'mom': {RAN:false, encounters:0},
            'a': {RAN:true, encounters:0},
            'of': {RAN:true, encounters:0},
            'poems': {RAN:false, encounters:0},
            'in': {RAN:true, encounters:0},
            'bed': {RAN:false, encounters:0},
            'have': {RAN:true, encounters:0},
            'her': {RAN:false, encounters:0},
            'own': {RAN:false, encounters:0},
            'be': {RAN:true, encounters:0},
            'i': {RAN:true, encounters:0},
            'you': {RAN:true, encounters:0},
            'it': {RAN:true, encounters:0},
            'something': {RAN:false, encounters:0},
            'do': {RAN:true, encounters:0},
            'if': {RAN:true, encounters:0},
            'that': {RAN:true, encounters:0},
            'with': {RAN:true, encounters:0},
            'me': {RAN:true, encounters:0},
            'will': {RAN:true, encounters:0},
            'sit': {RAN:false, encounters:0},
            'up': {RAN:true, encounters:0},
            'on': {RAN:true, encounters:0},
            'your': {RAN:false, encounters:0},
            'knee': {RAN:false, encounters:0},
            'how': {RAN:true, encounters:0},
            'say': {RAN:false, encounters:0},
            'soon': {RAN:false, encounters:0},
            'am': {RAN:true, encounters:0},
            'reading': {RAN:false, encounters:0},
            'my': {RAN:true, encounters:0}
        };
        window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    };
    
    $scope.getFamiliarWords = function () {
        var RANcount = 0;
        for (w in $scope.Words) {
            if ($scope.Words[w].RAN == true) {RANcount++};
        };
        window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
        return RANcount;
    };
        
    $scope.addWords = function () {
        var newWords = $scope.formInputText.toLowerCase().match(/\b[A-z']+/gi);
        $scope.formInputText = '';
        for (i=0; i<newWords.length; i++) {
            if ($scope.Words[newWords[i]] === undefined) {
                $scope.Words[newWords[i]] = {RAN:true, encounters: 1};
            } else {
                $scope.Words[newWords[i]].encounters++;
                if ($scope.Words[newWords[i]].encounters > 10) {
                    $scope.Words[newWords[i]].RAN = true;
                };
            };
        };
        delete $scope.Words['then'];
        window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    };
    
    $scope.readFluent = function (bookWords, title) {
        if (confirm("Add fluent reading of " + title)) {
            for (var word in bookWords) {
                if ($scope.Words[word] === undefined) {
                    $scope.Words[word] = {RAN:true, encounters: bookWords[word]};
                } else {
                    $scope.Words[word].encounters += bookWords[word];
                    $scope.Words[word].RAN = true;
                };
            };
        };
        delete $scope.Words['then'];
        window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    }
    $scope.readOnce = function (bookWords, title) {
        if (confirm("Add one reading of " + title)) {
            for (var word in bookWords) {
                if ($scope.Words[word] === undefined) {
                    $scope.Words[word] = {RAN:false, encounters: bookWords[word]};
                } else {
                    $scope.Words[word].encounters += bookWords[word];
                    if ($scope.Words[word].encounters > 10) {
                        $scope.Words[word].RAN = true;
                    };
                };
            };
        };
        delete $scope.Words['then'];
        window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    }

    var bookLibrary = {};

    if (window.localStorage.getItem('SaraBookLibrary') != null) {
        bookLibrary = JSON.parse(window.localStorage.getItem('SaraBookLibrary'));
        for (addition in addToLibrary) {
            if (bookLibrary[addition] == null) {
                bookLibrary[addition] = addToLibrary[addition];
            };
        };
        window.localStorage.setItem('SaraBookLibrary', JSON.stringify(bookLibrary));
    } else {
        bookLibrary = addToLibrary;
    };
    
    $scope.addBookRead = "Unread";
    $scope.newBookWords = [];
    $scope.addBook = function () {
        if ($scope.addBookTitle == '') {alert('please add a book title'); return;}
        if ($scope.addBookAuthor == '') {alert('please add a book author'); return;}
        if ($scope.addBookYear == '') {alert('please add a book year'); return;}
        if ($scope.addBookText == '') {alert('please add a book text'); return;}
        $scope.newBookWords = $scope.addBookText.toLowerCase().match(/\b[A-z']+/gi);
        $scope.newBookWords = _.countBy($scope.newBookWords, function(word) {
            return word;
        });
        delete $scope.newBookWords['then'];
        var bookName = $scope.addBookAuthor.toLowerCase().match(/\b[A-z']+/gi);
        bookName = bookName[bookName.length-1]+$scope.addBookYear+$scope.addBookTitle.replace(/[^A-z]+/gi,'').substring(0,8);
        bookLibrary[bookName] = {
            link: "",
            title: $scope.addBookTitle,
            author: $scope.addBookAuthor,
            year: $scope.addBookYear,
            publisher: $scope.addBookPublisher,
            words: $scope.newBookWords
        };
        postBook(bookName, bookLibrary[bookName]);
        window.localStorage.setItem('SaraBookLibrary', JSON.stringify(bookLibrary));
        
        if ($scope.addBookRead != "Unread") {
            //add 1 encounter to each word
            for (word in $scope.newBookWords) {
                if ($scope.Words[word] === undefined) {
                    if ($scope.addBookRead == "Fluent") {
                        $scope.Words[word] = {RAN:true, encounters: $scope.newBookWords[word]};
                    } else {
                        $scope.Words[word] = {RAN:false, encounters: $scope.newBookWords[word]};
                    };
                } else {
                    $scope.Words[word].encounters += $scope.newBookWords[word];
                    if ($scope.addBookRead == "Fluent") {
                        $scope.Words[word].RAN = true;
                    } else {
                        //make words with > 5 encounters RAN:true
                        if ($scope.Words[word].encounters > 5) {
                            $scope.Words[word].RAN = true;
                        };
                    };
                };
            };
            window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
        };
        
        $scope.addBookText = '';
        $scope.addBookTitle = '';
        $scope.addBookAuthor = '';
        $scope.addBookYear = '';
        $scope.addBookPublisher = '';
        
    };
    
    $scope.recommendationUpperLimit = 100;
    $scope.recommendationLowerLimit = 45;
    $scope.showRecommendations = function () {
        $scope.bookRecommendations = [];
        for (var book in bookLibrary) {
            var bookScore = scoreBook(bookLibrary[book], $scope.Words);
            if (bookScore >= $scope.recommendationLowerLimit && bookScore <= $scope.recommendationUpperLimit) {
                $scope.bookRecommendations.push({'score':bookScore, 'book':bookLibrary[book]});
            };
        };
        $scope.bookRecommendations = _.sortBy($scope.bookRecommendations, 'score');
        if ($scope.bookRecommendations.length > 5) {
            $scope.bookRecommendations = $scope.bookRecommendations; //trim to ideal
        };
    };
    $scope.showRecommendations();

    $scope.reset = function () {
        if (confirm("Resetting will unrecoverably clear the list of recognized words and reset it to the default. \nManually added books will also be removed from the library. \nAre you sure you want to proceed?")) {
            $scope.Words = {
            'this': {RAN:true, encounters:0},
            'is': {RAN:true, encounters:0},
            'sara': {RAN:false, encounters:0},
            'and': {RAN:true, encounters:0},
            'can': {RAN:true, encounters:0},
            'read': {RAN:false, encounters:0},
            'the': {RAN:true, encounters:0},
            'book': {RAN:false, encounters:0},
            'to': {RAN:true, encounters:0},
            'mom': {RAN:false, encounters:0},
            'a': {RAN:true, encounters:0},
            'of': {RAN:true, encounters:0},
            'poems': {RAN:false, encounters:0},
            'in': {RAN:true, encounters:0},
            'bed': {RAN:false, encounters:0},
            'have': {RAN:true, encounters:0},
            'her': {RAN:false, encounters:0},
            'own': {RAN:false, encounters:0},
            'be': {RAN:true, encounters:0},
            'i': {RAN:true, encounters:0},
            'you': {RAN:true, encounters:0},
            'it': {RAN:true, encounters:0},
            'something': {RAN:false, encounters:0},
            'do': {RAN:true, encounters:0},
            'if': {RAN:true, encounters:0},
            'that': {RAN:true, encounters:0},
            'with': {RAN:true, encounters:0},
            'me': {RAN:true, encounters:0},
            'will': {RAN:true, encounters:0},
            'sit': {RAN:false, encounters:0},
            'up': {RAN:true, encounters:0},
            'on': {RAN:true, encounters:0},
            'your': {RAN:false, encounters:0},
            'knee': {RAN:false, encounters:0},
            'how': {RAN:true, encounters:0},
            'say': {RAN:false, encounters:0},
            'soon': {RAN:false, encounters:0},
            'am': {RAN:true, encounters:0},
            'reading': {RAN:false, encounters:0},
            'my': {RAN:true, encounters:0}
            };
            window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
            bookLibrary = {};
            window.localStorage.setItem('SaraBookLibrary', angular.toJson(bookLibrary));
            location.reload(true);
        };
    }
}

function scoreBook (book, wordMap) {
    var bookScore = 0;
    var bookWordCount = 0;
    for (var word in book.words) {
        var wordCount = book.words[word];
        bookWordCount += wordCount;
        if (wordMap[word]) {
            if (wordMap[word].RAN){
                bookScore += wordCount;
            }
        };
    };
    bookScore = Number((bookScore / bookWordCount * 100).toFixed(0));
    return bookScore;
}

function postBook(bookName, book) {
    if (confirm(book.title + " has been added you your library. Would you help the community and share this with us so we can include it in the global library?")) {
        var email = "";
        if (window.localStorage.getItem('SaraUserEmail') != null) {
            email = window.localStorage.getItem('SaraUserEmail');
        } else {
            email = prompt("Please enter your email: ");
            window.localStorage.setItem('SaraUserEmail', email);
        };
        jQuery.ajax({
            url: "./addLibrary.php",
            data: {
                'email' : email,
                'bookName' : bookName,
                'bookJson' : angular.toJson(book)
            },
            type: "POST",
            dataType: "xml"
        });
    };
}
