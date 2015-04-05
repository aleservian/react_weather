/** @jsx React.DOM */
/*var url = 'http://api.openweathermap.org/data/2.5/forecast?lat='+position.coords.latitude+'&lon='+position.coords.longitude;*/
var DEG = 'c';
function convertTemperature(kelvin){
    return Math.round(DEG == 'c' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
}
var App = React.createClass({
  getDefaultProps:function(){
    return {
      active_class:'none_active'
    }
  },
  getInitialState:function(){
    return {
       data:[],
       city_name:'',
       city_country:'',
       week_name:'',
       icon_weather:'',
       celsius_max:'',
       celsius_min:'',
       activepreload:'block_active'
    }
  },
  transferProps:function(item){
    this.setState({
      week_name:item.day_week,
      icon_weather:item.icon,
      celsius_max:item.celsius_max,
      celsius_min:item.celsius_min
    })
  },
  componentDidMount:function(){
    var _this = this;
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(locationSuccess, locationError, {enableHighAccuracy:true});
    }
    else{
      showError("Your browser does not support Geolocation!");
    }
    function locationSuccess(position){
       var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&cnt=7',
           d = new Date(),
           offset = d.getTimezoneOffset()*60*1000;  
       atomic.get(url)
        .success(function (data, xhr) {
          var week_name = moment(new Date(data.list[0].dt*1000 - offset)).format('dddd'),
              icon_weather = data.list[0].weather[0].icon,
              celsius_max = convertTemperature(data.list[0].temp.max),
              celsius_min = convertTemperature(data.list[0].temp.min);
          if (_this.isMounted()){
            var newlistweather = [];
            for(var i=0,len=data.list.length;i<len;i++){
               var localTime = new Date(data.list[i].dt*1000 - offset),
                   weatheritem = {};
               weatheritem.day_week=moment(localTime).format('dddd');
               weatheritem.abbreviation_week=moment(localTime).format('ddd');
               weatheritem.celsius_max=convertTemperature(data.list[i].temp.max);
               weatheritem.celsius_min=convertTemperature(data.list[i].temp.min);
               weatheritem.icon=data.list[i].weather[0].icon;
               newlistweather.push(weatheritem);
            }
            _this.setState({
              data:newlistweather,
              city_name:data.city.name,
              city_country:data.city.country,
              week_name:week_name,
              icon_weather:icon_weather,
              celsius_max:celsius_max,
              celsius_min:celsius_min,
              activepreload:'none_active'
            });
            _this.setProps({active_class:'block_active'});
          }
        })
        .error(function (data, xhr) {

        });
    }
    function locationError(error){
       /*switch(error.code) {
        case error.TIMEOUT:
          showError("A timeout occured! Please try again!");
          break;
        case error.POSITION_UNAVAILABLE:
          showError('We can\'t detect your location. Sorry!');
          break;
        case error.PERMISSION_DENIED:
          showError('Please allow geolocation access for this to work.');
          break;
        case error.UNKNOWN_ERROR:
          showError('An unknown error occured!');
          break;
      }*/
    }
  },
  render: function() {
    var _this = this;
    return (
      <div className='weather'>
        <Preloader activepreload={this.state.activepreload}/>
        <div className={this.props.active_class + ' weatherin'}>
           <Weatherinfo 
              city_name={this.state.city_name} 
              city_country={this.state.city_country}
              week_name={this.state.week_name}
              icon_weather={this.state.icon_weather}
              celsius_max={this.state.celsius_max}
              celsius_min={this.state.celsius_min}/>
           <ul className="ul_main ul_weather">
             {this.state.data.map(function(item,i){
              var transferProps = _this.transferProps.bind(this, item);
               return (
                <WeatherList onClick={transferProps} number={i} data={item}/>
               )
             })}
           </ul>
        </div>
      </div>
    )
  }
});
var WeatherList = React.createClass({
  render:function(){
    return (
        <li onClick={this.props.onClick}>
           <span className="week_name">{this.props.data.abbreviation_week}</span>
           <div className={this.props.data.icon + ' iconweather'}></div>
           <div className="celsius_maxmin">
             <span>{this.props.data.celsius_max + "°"}</span>
             <span>{this.props.data.celsius_min + "°"}</span>
           </div>
        </li>
    )
  }
});
var Weatherinfo = React.createClass({
  render:function(){
    return (
      <div>
        <header>
           <h1>{this.props.city_name}, <strong>{this.props.city_country}</strong></h1>
           <span>{this.props.week_name}</span>
        </header>
        <div className={this.props.icon_weather + ' iconweather'}></div>
        <div className="celsius_maxmin">
          <span>{this.props.celsius_max + "°C"}</span>
          <span>/</span>
          <span>{this.props.celsius_min + "°C"}</span>
        </div>
      </div>
    )
  }
});
var Preloader = React.createClass({
  render:function(){
     return (<div className={this.props.activepreload + ' preloader'}></div>)
  }
})
React.render(<App />, document.getElementById('app'));