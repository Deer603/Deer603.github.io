document.querySelectorAll('.dc-tabs').forEach(function(section){
 var tabs=Array.from(section.querySelectorAll('[role="tab"]'));
 function activate(tab){tabs.forEach(function(item){var selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;});}
 tabs.forEach(function(tab,i){tab.addEventListener('click',function(){activate(tab);});tab.addEventListener('keydown',function(e){var next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(next!==undefined){e.preventDefault();activate(tabs[next]);tabs[next].focus();}});});activate(tabs[0]);
});
