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
            'mom': {RAN:true, encounters:0},
            'a': {RAN:true, encounters:0},
            'of': {RAN:true, encounters:0},
            'poems': {RAN:false, encounters:0},
            'in': {RAN:true, encounters:0},
            'bed': {RAN:true, encounters:0},
            'have': {RAN:true, encounters:0},
            'her': {RAN:true, encounters:0},
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
            'sit': {RAN:true, encounters:0},
            'up': {RAN:true, encounters:0},
            'on': {RAN:true, encounters:0},
            'your': {RAN:true, encounters:0},
            'knee': {RAN:false, encounters:0},
            'how': {RAN:true, encounters:0},
            'say': {RAN:true, encounters:0},
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
                if ($scope.Words[newWords[i]].encounters > 3) {
                    $scope.Words[newWords[i]].RAN = true;
                };
            };
        };
        delete $scope.Words['then'];
        window.localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    };

    var bookLibrary = {};

    if (window.localStorage.getItem('SaraBookLibrary') != null) {
        bookLibrary = JSON.parse(window.localStorage.getItem('SaraBookLibrary'));
    } else {
        bookLibrary = {
            "fugal2016ICanRead":{
                "title":"I Can Read a Book to You",
                "author":"Russ Fugal",
                "year":"2016",
                "publisher":"sara.ai books",
                "words":{
                    "i":6,
                    "can":2,
                    "read":3,
                    "a":1,
                    "book":2,
                    "to":1,
                    "you":4,
                    "it":1,
                    "is":2,
                    "something":1,
                    "do":2,
                    "if":1,
                    "that":1,
                    "with":2,
                    "me":1,
                    "will":1,
                    "sit":1,
                    "up":1,
                    "on":2,
                    "your":1,
                    "knee":1,
                    "and":2,
                    "this":3,
                    "how":1,
                    "say":1,
                    "soon":1,
                    "am":1,
                    "reading":1,
                    "my":1,
                    "own":1
                }
            },"fugal2016Primer":{
                "title":"Primer",
                "author":"Russ Fugal",
                "year":"2016",
                "publisher":"sara.ai books",
                "words":{
                    "sara":8,
                    "this":1,
                    "is":1,
                    "and":2,
                    "can":7,
                    "read":5,
                    "the":4,
                    "book":6,
                    "to":1,
                    "mom":1,
                    "a":2,
                    "of":2,
                    "poems":1,
                    "in":1,
                    "bed":1,
                    "have":1,
                    "her":1,
                    "own":2,
                    "be":1,
                    "sara's":1}
            }
        };
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
            title: $scope.addBookTitle,
            author: $scope.addBookAuthor,
            year: $scope.addBookYear,
            publisher: $scope.addBookPublisher,
            words: $scope.newBookWords
        };
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
    
    $scope.showRecommendations = function () {
        $scope.bookRecommendations = [];
        for (var book in bookLibrary) {
            var bookScore = scoreBook(bookLibrary[book], $scope.Words);
            if (bookScore > 50 && bookScore < 100) {
                $scope.bookRecommendations.push({'score':bookScore, 'book':bookLibrary[book]});
            };
        };
        $scope.bookRecommendations = _.sortBy($scope.bookRecommendations, 'score');
        if ($scope.bookRecommendations.length > 5) {
            $scope.bookRecommendations = $scope.bookRecommendations; //trim to ideal
        };
    };
    $scope.showRecommendations();
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
    bookScore = (bookScore / bookWordCount * 100).toFixed(0);
    return bookScore;
}