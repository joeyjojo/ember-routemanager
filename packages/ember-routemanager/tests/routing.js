var routeManager;

module('Ember.RouteManager', {
  setup: function() {
  },
  
  teardown: function() {
    if(routeManager) routeManager.destroy();
  }
});

test('Setup', function() {
  var routeManager = Ember.RouteManager.create();
  equals(routeManager._didSetup, NO, 'Route manager should not have been setup yet');
  routeManager.destroy();
});


test('Basic Static Route', function() {
  
  var stateReached = false;
  
  routeManager = Ember.RouteManager.create({
    posts: Ember.State.create({
      path: 'posts',
      
      comments: Ember.State.create({
        path: 'comments',
        enter: function() {
          stateReached = true;
        }
      })
    })
  });
  
  routeManager.set('location', 'posts/comments');
  
  ok(stateReached, 'The state should have been reached.')
});

test('Multi-part Static Routes', function() {
  
  var stateReached = false;
  
  routeManager = Ember.RouteManager.create({
    posts: Ember.State.create({
      path: 'posts',
      
      comments: Ember.State.create({
        path: 'comments/all',
        enter: function() {
          stateReached = true;
        }
      })
    })
  });
  
  routeManager.set('location', 'posts/comments/all');
  
  ok(stateReached, 'The state should have been reached.')
});


test('Route With Params', function() {
  
  var commentId;
  var postId;
  
  routeManager = Ember.RouteManager.create({
    post: Ember.State.create({
      path: 'posts/:postId',
      enter: function(stateManager) {
        postId = stateManager.params.postId
      },
      
      comment: Ember.State.create({
        path: 'comments/:commentId',
        enter: function(stateManager) {
          commentId = stateManager.params.commentId
        }
      })
    })
  });
  
  routeManager.set('location', 'posts/1/comments/4');
  
  equals(postId, 1, "The first param should have been set.");
  equals(commentId, 4, "The second param should have been set.");
});

test('Routes With Pathless State', function() {
  var stateReached = false;
  
  routeManager = Ember.RouteManager.create({
    post: Ember.State.create({
      path: 'posts/:postId',
      enter: function(stateManager) {
        postId = stateManager.params.postId
      },
      admin: Ember.State.create({
        edit: Ember.State.create({
          path: 'edit',
          enter: function() {
            stateReached = true;
          }
        })
      })
      
    })
  });
  
  routeManager.set('location', 'posts/1/edit');
  
  ok(stateReached, 'The state should have been reached.')
});

test("Route With Accept Logic", function() {
  var isAdmin = true;
  var stateReached = false;
  
  routeManager = Ember.RouteManager.create({
    post: Ember.State.create({
      path: 'posts/:postId',
      enter: function(stateManager) {
        postId = stateManager.params.postId
      },
      admin: Ember.State.create({
        willAccept: function() {
          return isAdmin;
        },
        edit: Ember.State.create({
          path: 'edit',
          enter: function() {
            stateReached = true;
          }
        })
      })
      
    })
  });
  
  routeManager.set('location', 'posts/1/edit');
  ok(stateReached, 'The state should have been reached.');
  
  routeManager.set('location', 'posts/1');
  isAdmin = false;
  stateReached = false;
  
  routeManager.set('location', 'posts/1/edit');
  ok(!stateReached, 'The state should not have been reached.');
});

test("Route Ending on Pathless State", function() {
  var stateReached = false;
  
  routeManager = Ember.RouteManager.create({
    post: Ember.State.create({
      path: 'posts',
      
      show: Ember.State.create({
        enter: function() {
          stateReached = true;
        }
      })
      
    })
  });
  
  routeManager.set('location', 'posts');
  
  ok(stateReached, 'The state should have been reached.');
});

test('Route With Home State', function() {
  
  var postsReached = false;
  var commentsReached = false;
  var homeReached = false;
  
  routeManager = Ember.RouteManager.create({
    posts: Ember.State.create({
      path: 'posts',
      enter: function() {
        postsReached = true;
      },
      
      comments: Ember.State.create({
        path: 'comments',
        enter: function() {
          commentsReached = true;
        }
      })
    }),
    
    home: Ember.State.create({
      enter: function() {
        homeReached = true;
      }
    })
  });
  
  routeManager.set('location', ''); 
  ok(homeReached, 'The home state should have been reached.');
  
  homeReached = false;
  
  routeManager.set('location', 'posts');
  ok(!postsReached, 'Only leaf states can be routed to');
  
  routeManager.set('location', 'posts/comments');
  
  ok(postsReached, 'Intermediary state should have been reached.');
  ok(commentsReached, 'Leaf state should have been reached');
  ok(!homeReached, 'The home state should not have been reached.')
  equals(routeManager.get('currentState'), routeManager.getPath('posts.comments'), "The current state should be set correctly.");
});

test("Parameter-Only Changes", function() {
  postsEnterCount = 0;
  postsExitCount = 0;
  commentsEnterCount = 0;
  commentsExitCount = 0;
  
  routeManager = Ember.RouteManager.create({
    posts: Ember.State.create({
      path: 'posts',
      enter: function() {
        postsEnterCount++;
      },
      exit: function() {
        postsExitCount++;
      },
      post: Ember.State.create({
        path: ':postId',
        comments: Ember.State.create({
          path: 'comments',
          enter: function() {
            commentsEnterCount++;
          },
          exit: function() {
            commentsExitCount++;
          }
        })
      
      })
    })
  });
  
  routeManager.set('location', 'posts/1/comments');
  
  equals(postsEnterCount, 1, 'posts enter count');
  equals(postsExitCount, 0, 'posts exit count')
  equals(commentsEnterCount, 1, 'comments enter count');
  equals(commentsExitCount, 0, 'comments exit count');
  
  routeManager.set('location', 'posts/2/comments');
  
  equals(postsEnterCount, 1, 'posts enter count');
  equals(postsExitCount, 0, 'posts exit count')
  equals(commentsEnterCount, 2, 'comments enter count');
  equals(commentsExitCount, 1, 'comments exit count');
});
