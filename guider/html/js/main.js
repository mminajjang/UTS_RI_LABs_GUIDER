var voice = new Audio('change_screen.ogg');
var session = new QiSession(function(session){
    console.log("connected!");
    }, function(){
        console.log("disconnected!");
});
// *** INITIALIZATION *** //    
var mode = 1;                       //when true, Auto detective otherwise user trigger

var current_volume = 30;            //
var mute_state = false;             //
var guider_start = false;           // to make sure this loop runs once for initialization
var robotname;
$(document).ready(  function(){
    if(!guider_start){
        /* volume */ 
        session.service("ALAudioDevice").then(function(audio){
            audio.getOutputVolume().then(function(vol){
                current_volume = vol;
                }, function(error){current_volume = 30;});
            audio.isAudiOutMuted().tehn(function(mute){
                mute_state = mute;
            }, function(error){mute_state = 0;});
            audio.setOutputVolume(current_volume);
        });
        /* vocie and speed */ 
        session.service("ALTextToSpeech").then(function(tts){
            tts.setParameter("speed", 90);
            tts.setParameter("pitchShift", 1.1);
        });
        /* animated mode */ 
        session.service("ALAnimatedSpeech").then(function(tts){
            tts.setBodyLanguageMode(2);
        });

        session.service("ALSystem").then( function(system){
            system.robotName().then( function(name){
                robotname = name;
            }, function(error){robotname="pepper";});
        });
        guider_start = true;
    }
});


// *** SUBSCRIBE EVENTS *** //
 session.service("ALMemory").then(function(memory){
    /* speech status */
    memory.subscriber("ALTextToSpeech/TextDone").then(function(subscriber){
        subscriber.signal.connect(eventCallback_text_done);
    });
    memory.subscriber("ALTextToSpeech/TextInterrupted").then(function(subscriber){
        subscriber.signal.connect(eventCallback_text_interrupted);
    });
    memory.subscriber("ALTextToSpeech/Status").then(function(subscriber){
        subscriber.signal.connect(eventCallback_speaking_status);
    });
       /* Human Tracking */
    memory.subscriber("ALBasicAwareness/HumanTracked").then(function(subscriber){
        subscriber.signal.connect(eventDonecallback_human_tracked);
    });
});

// *** EVENTCALLBACK FUNCTIONS *** //
function eventCallback_text_done(state){
    if(state){
    }
}

function eventCallback_text_interrupted(state){
    if (state){
    }
}

var speaking_status; 
function eventCallback_speaking_status(state){
    speaking_status = state[1];
}

function eventDonecallback_human_tracked(state){
    if(state == -1){
        stopSpeak();
    }
    else{
        if(speaking_status != 'started'){
            speak_start(current_page, 'intro');
        }
    }
}

var current_page = 'HOME';                          
var pages = {'HOME' :'UTS Labs', 
            'RI' :'UTS Robotics Institute', 
            'HRI': 'Human-Robot Interaction Lab',
            'IR' : 'Intelligent Robotics Lab',
            'IF' : 'Infrastructure Lab',
            'FEEDBACK': 'Please give me your thoughts !'};          // { pageId : headline }

// *** PAGE CONFIGURATION *** //
function changeToHomePage(pageID){
    console.log("Display home page ");
    $('body').removeClass();
    $('body').toggleClass('background_home', 1);
    $("#header_logo").html(pages[pageID]);
    $("#header_logo").css('color', 'black');
    $("#lab_selectors").show();
    $(".button_exit").show();
    $(".button_home").hide();
    $("#detail_page_content").hide();
}
function changeToLabPage(pageID){
    console.log('changed to ' + $("#" + pageID).html());
    $('body').removeClass();
    $('body').toggleClass('background_page', 1);
    $("#header_logo").html(pages[pageID]);
    $("#header_logo").css('color', 'white');
    $("#lab_selectors").hide();
    $(".button_exit ").hide();
    $(".button_home").show();
    $("#detail_page_content").show();
    $("#button_more_info").show();
}
function changeToFeedback(pageID){
    console.log("Display feedback page ");
    $('body').removeClass();
    $('body').toggleClass('background_home', 1);
    $("#header_logo").html(pages[pageID]);
    $("#header_logo").css('color', 'black');
    $("#lab_selectors").hide();
    $(".button_exit").hide();
    $("#button_more_info").hide();
    $(".button_home").show();
    $("#detail_page_content").show();
}

/* adding projects list on each lab page */ 
function add_projects_to_page(pageID){
    proj_info = [];
    for(var i=0; i<projects[pageID].length; i++){

        var name = projects[pageID][i]['name'];
        var projectUrl = projects[pageID][i]['imgUrl'];
        if(typeof(projectUrl) == 'undefined' || projectUrl == ''){projectUrl = 'url(images/banner.svg)' ;}
        if(i>2){
            $(".projects").append(
                '<div id="' + name + '" class="project_items line2" style="background-image: '+projectUrl+'">'+
                    '<div>' + name+'</div>'+
                '</div>'
            ); 
        }
        else{
            $(".projects").append(
                '<div id="' + name + '" class="project_items"  style="background-image: '+projectUrl+'">'+
                    '<div>' + name+'</div>'+
                '</div>'
            ); 
        }
    }
}

/*  adding QR code and button for more informaiton on each lab page */
function add_property_to_page(pageID){
    if(pageID == 'HOME'){
        $(".projects").empty();
        $(".info_container").empty();
    }
    else if(pageID == 'FEEDBACK'){
        $(".info_container").append(
            '<div id="qr" type="img" style="background-image:url(images/QR_' + pageID + '.png)" ></div>'
        );
    }
    else{
        add_projects_to_page(pageID);
        $(".info_container").append(
        '<div id="qr" type="img" style="background-image:url(images/QR_' + pageID + '.png)" ></div>' + 
        '<button id="info_'+ pageID +'" class="button_info"> More Information >> </button>'
    );
    }
    $(".button_info").click( function(){
        console.log("Saying more information ");
        var pageID = $(this).attr('id').substring(5);
        stopSpeak();
        speak_start(pageID, 'moreinfo');
    });
}

function changePage(pageID){
    current_page = pageID;
    add_property_to_page(pageID);
    if(pageID == 'HOME'){ changeToHomePage('HOME'); }
    else if (pageID == 'FEEDBACK'){ changeToFeedback('FEEDBACK');}
    else{changeToLabPage(pageID); }
}

function adjust_volume(diff){
    session.service("ALAudioDevice").then(function(audio){
        current_volume += diff;
        if(current_volume > 100){
            current_volume = 100;
        }
        else if (current_volume < 0){
            current_volume = 0;
        }
        audio.setOutputVolume(current_volume);
    });
}

function mute_volume(){
    session.service("ALAudioDevice").then(function(audio){
        if(mute_state){
            audio.muteAudioOut(0);
            audio.setOutputVolume(current_volume);
            mute_state = false;
        }
        else{
            audio.muteAudioOut(1);
            mute_state = true;
        }
    });
}

/* exit the webpage by stopping behaviour to launch webview */ 
function exit(){
    session.service("ALBehaviorManager").then(function(behaviour){
        behaviour.stopAllBehaviors();
    });
}

function hide_dropdown(name){
    if (typeof(name) == 'undefined'){
        $(".dropdown_menu_content").hide();
        $(".dropdown_setting_content").hide();
    }
    else{
        if( $(".dropdown_"+name+"_content").css("display") == 'block'){
            $(".dropdown_"+name+"_content").hide();
        }
        else{
            $(".dropdown_"+name+"_content").show();
        }
    }
}

/* Subscribe speech Event */
function speak(speakText){
    session.service("ALAnimatedSpeech").then(function(tts){
        tts.say(speakText);
    });
}
function stopSpeak(){
    session.service("ALTextToSpeech").then(function(tts){
        tts.stopAll();
    });
}
function standInit(){
    session.service("ALRobotPosture").then(function(posture){
        posture.goToPosture('Standzero',1.0);
    });
}

function speak_start(pageId, tagId){
    var text = labs_info[pageId][tagId];
    text = text.replace('ROBOTNAME', robotname);
    speak(text);
}

$(document).ready(  function(){
    $('button').click(function(){
        voice.play();
    });

    $('.button_main').click( function(){
        console.log("clicked" + $(this).html());
        changePage($(this).attr('id'));
        $(".dropdown_setting_content .dropdown_menu_content").hide();
        hide_dropdown();
        speak_start($(this).attr('id'), 'intro');
    });
    
    $('.button_home').click( function(){
        console.log(" go back to home");
        changePage('HOME');
        $(".dropdown_setting_content .dropdown_menu_content").hide();
        stopSpeak();
        hide_dropdown('');
        standInit();
    });

    $('.button_exit').click( function(){
        console.log("Exit");
        exit();
        hide_dropdown('');
    });

    $('#button_menu').click( function(){
        console.log('clicked menu');
        hide_dropdown('menu');
    });

    $("#button_setting").click(function(){ 
        console.log(" clicked setting button " );
        hide_dropdown('setting');
    });

    $("#button_volume_up").click(function(){
        adjust_volume(5)});
    $("#button_volume_down").click(function(){
        adjust_volume(-5)});
    $("#button_volume_mute").click(function(){
        mute_volume()}); 
});