        function unique(arr) {
            var u = {}, a = [];
            for(var i = 0, l = arr.length; i < l; ++i){
                if(!u.hasOwnProperty(arr[i])) {
                    a.push(arr[i]);
                    u[arr[i]] = 1;
                }
            }
            return a;
        }

        var edit_link = 'wp-admin/post.php?post=';
        var trash = 'action=trash';
        var result = [];
        var theLinks = document.links;
        for (var i = 0; i < theLinks.length; i++) {
            if (theLinks[i].href.indexOf('javascript:') == -1) {
                if (theLinks[i].href.indexOf(edit_link) > -1) {
                    if (theLinks[i].href.indexOf(trash) == -1) {
                        result.push(theLinks[i].href);
                    }
                }
            }
        }

    var to_clip_board = unique(result);
    var result_to_clip_board = '';
    for (var x = 0; x < to_clip_board.length; x++) {
        result_to_clip_board += to_clip_board[x] + '\n';
    }

    chrome.runtime.sendMessage({
        type: 'copy',
        text: result_to_clip_board
    });