function WordsCtrl($scope) {
    
    if (localStorage.getItem('SaraWordModel') != null) {
        $scope.Words = JSON.parse(localStorage.getItem('SaraWordModel'));
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
    };
    
    $scope.getFamiliarWords = function () {
        var RANcount = 0;
        for (word in $scope.Words) {
            if ($scope.Words[word].RAN) {RANcount++};
        };
        localStorage.setItem('SaraWordModel', JSON.stringify($scope.Words));
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
    };
}