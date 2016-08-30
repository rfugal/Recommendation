function WordsCtrl($scope) {
    
    if (localStorage.getItem('SaraWordModel') != null) {
        $scope.Words = angular.fromJson(localStorage.getItem('SaraWordModel'));
    } else {
        $scope.Words = {
            'this': {RAN:true, encounters:0},
            'is': {RAN:true, encounters:0},
            'sara': {RAN:true, encounters:0},
            'and': {RAN:true, encounters:0},
            'can': {RAN:true, encounters:0},
            'read': {RAN:true, encounters:0},
            'the': {RAN:true, encounters:0},
            'book': {RAN:true, encounters:0},
            'to': {RAN:true, encounters:0},
            'mom': {RAN:true, encounters:0},
            'a': {RAN:true, encounters:0},
            'of': {RAN:true, encounters:0},
            'poems': {RAN:true, encounters:0},
            'in': {RAN:true, encounters:0},
            'bed': {RAN:true, encounters:0},
            'have': {RAN:true, encounters:0},
            'her': {RAN:true, encounters:0},
            'own': {RAN:true, encounters:0},
            'be': {RAN:true, encounters:0},
            'i': {RAN:true, encounters:0},
            'you': {RAN:true, encounters:0},
            'it': {RAN:true, encounters:0},
            'something': {RAN:true, encounters:0},
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
            'knee': {RAN:true, encounters:0},
            'how': {RAN:true, encounters:0},
            'say': {RAN:true, encounters:0},
            'soon': {RAN:true, encounters:0},
            'am': {RAN:true, encounters:0},
            'reading': {RAN:true, encounters:0},
            'my': {RAN:true, encounters:0}
        };
        localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    };
    
    $scope.getFamiliarWords = function () {
        var RANcount = 0;
        for (w in $scope.Words) {
            if ($scope.Words[w].RAN == true) {RANcount++};
        };
        return RANcount;
    };
    
    
    $scope.addWords = function () {
        var newWords = $scope.formInputText.toLowerCase().match(/\b[A-z']+/gi);
        $scope.Words = angular.fromJson(localStorage.getItem('SaraWordModel'));
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
        localStorage.setItem('SaraWordModel', angular.toJson($scope.Words));
    };
}

var bookLibrary = {};

if (localStorage.getItem('SaraBookLibrary') != null) {
    bookLibrary = angular.fromJson(localStorage.getItem('SaraBookLibrary'));
};

function addBooksCtrl($scope) {
    $scope.addBookRead = "Read";
    $scope.newBookWords = [];
    $scope.addBook = function () {
        $scope.newBookWords = $scope.addBookText.toLowerCase().match(/\b[A-z']+/gi);
        alert($scope.newBookWords)
        $scope.newBookWords = _.countBy($scope.newBookWords, function(w) {
            return w;
        });
        var bookName = $scope.addBookAuthor.toLowerCase().match(/\b[A-z']+/gi);
        bookName = bookName[bookName.length-1]+$scope.addBookYear+$scope.addBookTitle.toLowerCase().match(/\b[A-z']+/gi)[0];
        bookLibrary[bookName] = {
            title: $scope.addBookTitle,
            author: $scope.addBookAuthor,
            year: $scope.addBookYear,
            publisher: $scope.addBookPublisher,
            words: $scope.newBookWords
        };
        localStorage.setItem('SaraBookLibrary', angular.toJson(bookLibrary));
        
        if ($scope.addBookRead != "Unread") {
            var wordModel = angular.fromJson(localStorage.getItem('SaraWordModel'));
            //add 1 encounter to each word
            for (word in $scope.newBookWords) {
                if (wordModel[word] === undefined) {
                    wordModel[word] = {RAN:false, encounters: 1};
                } else {
                    wordModel[word].encounters++;
                };
            }
            if ($scope.addBookRead == "Fluent") {
                for (word in $scope.newBookWords) {
                    wordModel[word].RAN = true;
                };
            } else if ($scope.addBookRead == "Read") {
                //make words with > 3 encounters RAN:true
                for (word in $scope.newBookWords) {
                    if (wordModel[word].encounters > 3) {
                        wordModel[word].RAN = true;
                    };
                };
            };
            localStorage.setItem('SaraWordModel', angular.toJson(wordModel));
        };
        
        $scope.addBookText = '';
        $scope.addBookTitle = '';
        $scope.addBookAuthor = '';
        $scope.addBookYear = '';
        $scope.addBookPublisher = '';
        
    };
}