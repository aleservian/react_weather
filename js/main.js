/** @jsx React.DOM */
var DEG = 'c';
function convertTemperature(kelvin){
    // Convert the temperature to either Celsius or Fahrenheit:
    return Math.round(DEG == 'c' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
}
var App = React.createClass({
  getInitialState:function(){
    return {
       data:[]
    }
  },
  componentDidMount:function(){
    var _this = this;
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }
    else{
      showError("Your browser does not support Geolocation!");
    }
    function locationSuccess(position){
       /*var url = 'http://api.openweathermap.org/data/2.5/forecast?lat='+position.coords.latitude+'&lon='+position.coords.longitude;*/
       var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&cnt=7',
           d = new Date(),
           offset = d.getTimezoneOffset()*60*1000;  
       atomic.get(url)
        .success(function (data, xhr) {
          if (_this.isMounted()){
            for(var i=0,len=data.list.length;i<len;i++){
               var localTime = new Date(data.list[i].dt*1000 - offset);
               data.list[i].dt=moment(localTime).format('dddd');
               data.list[i].temp.min=convertTemperature(data.list[i].temp.min);
               data.list[i].temp.max=convertTemperature(data.list[i].temp.max);
            }
            _this.setState({data:data.list});
          }
        })
        .error(function (data, xhr) {

        });
    }
    function locationError(){

    }
  },
  render: function() {
    return (
      <div>
         {this.state.data.map(function(iten,i){
           return <Weatherinfo number={i} data={iten}/>
         })}
      </div>
    )
  }
});
var Weatherinfo = React.createClass({
  transformData:function(data){

  },
  render:function(){
    return (
        <div>
           <span className="test">{this.props.data.dt}</span>
           <span className="test">{this.props.data.temp.max}°</span>
           <span className="test">{this.props.data.temp.min}°</span>
        </div>
    )
  }
});
React.render(<App />, document.getElementById('app'));