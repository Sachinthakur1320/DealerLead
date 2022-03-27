/*
   renderTemplateInMemory method allows the expansion in memory of a knockout template. 
   This is useful when we add dynamically DOM elements to the application DOM under an already existing knockout binding.

   Arguments:
       - templateName : knockout template name
       - templateViewModel : the view model we want to bind to the template view

   Returns:
       - the generated html as a string. This can be used later on to add to the DOM.

   Example of use:
   var generatedHtml= ko.renderTemplateInMemory('my_template', myViewModel);

   This returns the html generated starting from my_template.

   Real example:

   <script type="text/html" id="msrpOptionIncludes-template">
       <div data-bind="foreach: includes">
           <span data-bind="text: $data"></span><br/>        
       </div>
   </script>

   <div data-bind="foreach : msrpOptions">
       <a href="javascript:;" data-bind="popover: {
                                                   title:description,
                                                   content: ko.renderTemplateInMemory('msrpOptionIncludes-template', $data),
                                                   trigger: 'click',
                                                   html: true
                                              }"><span data-bind="text: description"></span></a>
   </div>

    We can see here that we want to populate content for a popover with a string, and we use the template above to generate it.
*/
(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(["knockout", "jquery"], definition);
        // CommonJS and <script>
    } else {
        definition(window.ko, $);
    }
})(function (ko, $) {
    ko.renderTemplateInMemory = function (templateName, templateViewModel) {
        // create temporary container for rendered html
        var temp = $("<div>");
        // apply "template" binding to div with specified data
        ko.applyBindingsToNode(temp[0],
        {
            template: {
                name: templateName,
                data: templateViewModel
            }
        });
        // save inner html of temporary div
        var html = temp.html();
        // cleanup temporary node and return the result
        temp.remove();
        return html;
    };
});