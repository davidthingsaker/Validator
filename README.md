
# Validator
## Laravel style jquery validation plugin
Validator is a jQuery plugin that emulates the [validation class](http://laravel.com/docs/validation) found in the laravel framework.

## Usage
The validator plugin will return an instance of the validator object.

### Basic Validation Example
```
var contactForm = $('form').validator({
    'name' : 'required|max:12'
});
```
### Without a jQuery collection
When a jQuery collection is not being used as the data source, you can use an object as the first argument as the data source.</p>
```
var contactForm = $.validator(
    {'name' : 'Alice'},
    {'name' : 'required|max:12'}
);
```
The ```fails``` and ```passes``` functions are used to perform the validation once a Validator object has been created. These methods take an anonymous function as there only arguments which will be called once the validation occurs.

```
contactForm.fails(function( messages ){
     // The given data did not pass validation
});
```

The context of these functions is the data source. They also returns a ```Boolean``` value.
```
if(contactForm.fails()){
     // The given data did not pass validation
}
```
### Error Messages

```all()```
Retrives all the messages on all fields

```allElements()```
Retrives all the elements with messages

```get( String field )```
Retrives all the messages on a particular field

```any()```
returns true if any fields have any messages

```count()```
returns the number of messages over all the fields

```first( String field )```
gets the first message on a particular element

```has( String field )```
checks if a given field has any messages

### Custom Messages
A JSON array of custom error messages can be passed as a third argument. Occurances of <code>:attribute</code> will be replaced with the field name as well as rule parameters when applicable.

```
var contactForm = $(this).validator(
    {'name'    :'required|between:1,10|alpha_dash'},
    {'between' :':attribute must be between :min and :max'}
);
```

#### Specifying A Custom Message For A Given Attribute
```
var contactForm = $(this).validator(
    {'name'         :'required|between:1,10|alpha_dash'},
    {'name.between' :':attribute must be between :min and :max'}
);
```

### Validation Rules
Most of the Validation rules in the laravel framework are also avaliable in this plugin, with the exceptions of Active URL, Date Format, Exists (Database), Image (File), MIME Types and Unique (Database). You can find more information on the validation rules in the [laravel documentation](http://laravel.com/docs/validation#available-validation-rules)

* After (Date) ```after:date```
* alpha_dash   ```alpha```
* Alpha Dash   ```alpha_dash```
* Alpha Numeric```alpha_num```
* Before (Date)```before:date```
* Between      ```between:min,max```
* Confirmed    ```confirmed```
* Date         ```date```
* Different    ```different:field```
* E-Mail       ```email```
* In           ```in:foo,bar...```
* Integer      ```Integer```
* IP Address   ```ip```
* Max          ```max:value```
* Min          ```min:value```
* Not In       ```not_in:foo,bar...```
* Numeric      ```numeric```
* Regular Expression```regex:pattern```
* Required     ```required```
* Required If  ```required_if:field,value```
* Required With```required_with:foo,bar...```
* Required Without```required_without:foo,bar...```
* Same         ```same:field```
* Size         ```size:value```
* URL          ```url```
            
### Custom Rules
The extend function takes three arguments. the final argument is an array of message placeholders. The rule parameters are mapped onto this array. In the example below, occurances of ```:foo``` get replaced with the value of ```parameters[0]```
```
contactForm.extend('myRule', function(attribute, value, parameters){
     // Return Boolean
}, [':foo', ':bar']);
```
### Example
The following toggles the error class on fields with errors and submits the form once it has been successfully validated.
```$('form').submit(function(e){
            e.preventDefault();

            $('form input').removeClass('error');
            
            var contactForm = $(this).validator({
                'name' :'required|max:12',
                'email' : 'required|email'
            });

            contactForm.fails(function( messages ){
                messages.allElements().addClass('error');
            });

            contactForm.passes(function(){
                $(this).submit();
            });
        });
```
This repo was initially forked from @Tom-Alexander
