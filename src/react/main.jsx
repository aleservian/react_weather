/** @jsx React.DOM */

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
       id_weather: 0,
       messageerror:'',
       activepreload:'block_active'
    }
  },
  transferProps:function(item,i){
    this.setState({
      id_weather:i,
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
      _this.setState({
        messageerror:'Your browser does not support Geolocation!'
      });
    }
    function locationSuccess(position){
       var weatherCache = JSON.parse(localStorage.getItem('weatherCache')),
           dn = Date.now(),
           DEG = 'c';
       function convertTemperature(kelvin){
           return Math.round(DEG == 'c' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
       }
       function mount(data){
         var d = new Date(),
             offset = d.getTimezoneOffset()*60*1000; 
         if (_this.isMounted()){
            var week_name = moment(new Date(data.list[0].dt*1000 - offset)).format('dddd'),
                icon_weather = data.list[0].weather[0].icon,
                celsius_max = convertTemperature(data.list[0].temp.max),
                celsius_min = convertTemperature(data.list[0].temp.min),
                newlistweather = [];
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
       }
       function cache(){
          var weatherCache = JSON.parse(localStorage.getItem('weatherCache'));
          mount(weatherCache.data);
       }
       function xhr(){
          var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&cnt=7';
          atomic.get(url)
            .success(function (data, xhr) {
              localStorage.setItem('weatherCache', JSON.stringify({timestamp:Date.now(),data: data}));
              mount(data);
            })
            .error(function (data, xhr) {
              _this.setState({
                messageerror:'Connection Error'
              });
            });
       }
       
       if (weatherCache!==null && weatherCache.timestamp > dn - 30*60*1000){
           cache();
       }else{
           xhr();
       }
    }
    function locationError(error){
       switch(error.code) {
        case error.TIMEOUT:
          _this.setState({
            messageerror:'A timeout occured! Please try again!'
          });
          break;
        case error.POSITION_UNAVAILABLE:
          _this.setState({
            messageerror:'We can\'t detect your location. Sorry!'
          });
          break;
        case error.PERMISSION_DENIED:
          _this.setState({
            messageerror:'Please allow geolocation access for this to work.'
          });
          break;
        case error.UNKNOWN_ERROR:
          _this.setState({
            messageerror:'An unknown error occured!'
          });
          break;
      }
    }
  },
  render: function() {
    var _this = this;
    return (
      <div className='weather'>
        <Messageerror message={this.state.messageerror} />
        <Preloader activepreload={this.state.activepreload}/>
        <div className={this.props.active_class + ' weatherin'}>
           <Weatherinfo 
              city_name={this.state.city_name} 
              city_country={this.state.city_country}
              week_name={this.state.week_name}
              icon_weather={this.state.icon_weather}
              celsius_max={this.state.celsius_max}
              celsius_min={this.state.celsius_min}/>
           <ul className="ul_main ul_main_float ul_weather cl">
             {this.state.data.map(function(item,i){
              var transferProps = _this.transferProps.bind(this, item, i);
               return (
                <WeatherList selected={i===_this.state.id_weather} onClick={transferProps} number={i} data={item}/>
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
    var cx = React.addons.classSet;
    var classes = cx({
      'sun': this.props.data.icon==='01d',
      'moon': this.props.data.icon==='01n',
      'cloud sun': this.props.data.icon==='02d',
      'cloud moon': this.props.data.icon==='02n',
      'cloud': this.props.data.icon==='03d',
      'cloud': this.props.data.icon==='03n',
      'cloud wind': this.props.data.icon==='04d',
      'cloud wind': this.props.data.icon==='04n',
      'rain': this.props.data.icon==='09d',
      'rain': this.props.data.icon==='09n',
      'rain sun': this.props.data.icon==='10d',
      'rain moon': this.props.data.icon==='10n',
      'lightning sun': this.props.data.icon==='11d',
      'lightning moon': this.props.data.icon==='11n',
      'snow sun': this.props.data.icon==='13d',
      'snow moon': this.props.data.icon==='13n',
      'fog sun': this.props.data.icon==='50d',
      'fog moon': this.props.data.icon==='50n'
    });
    return (
        <li onClick={this.props.onClick} className={this.props.selected ? "selected" : ""}>
           <span className="week_name">{this.props.data.abbreviation_week}</span>
           <div className={classes + ' iconweather climacon'}></div>
           <div className="celsius_maxmin">
             <span>{this.props.data.celsius_max + "°" + this.props.data.celsius_min + "°"}</span>
           </div>
        </li>
    )
  }
});
var Weatherinfo = React.createClass({
  render:function(){
    var cx = React.addons.classSet;
    var classes = cx({
      'sun': this.props.icon_weather==='01d',
      'moon': this.props.icon_weather==='01n',
      'cloud sun': this.props.icon_weather==='02d',
      'cloud moon': this.props.icon_weather==='02n',
      'cloud': this.props.icon_weather==='03d',
      'cloud': this.props.icon_weather==='03n',
      'cloud wind': this.props.icon_weather==='04d',
      'cloud wind': this.props.icon_weather==='04n',
      'rain': this.props.icon_weather==='09d',
      'rain': this.props.icon_weather==='09n',
      'rain sun': this.props.icon_weather==='10d',
      'rain moon': this.props.icon_weather==='10n',
      'lightning sun': this.props.icon_weather==='11d',
      'lightning moon': this.props.icon_weather==='11n',
      'snow sun': this.props.icon_weather==='13d',
      'snow moon': this.props.icon_weather==='13n',
      'fog sun': this.props.icon_weather==='50d',
      'fog moon': this.props.icon_weather==='50n'
    });
    return (
      <div className="info_weather">
        <header className="header_weather">
           <h1>{this.props.city_name +','}<strong>{this.props.city_country}</strong></h1>
           <p><strong>{this.props.week_name}</strong></p>
        </header>
        <div className={classes + ' iconweather climacon'}></div>
        <div className="celsius_maxmin">
          <span>{this.props.celsius_max + "°C" + ' / ' + this.props.celsius_min + "°C"}</span>
        </div>
      </div>
    )
  }
});
var Preloader = React.createClass({
  render:function(){
     return (<div className={this.props.activepreload + ' preloader'}></div>)
  }
});
var Messageerror = React.createClass({
  render:function(){
    return (<div className='messageerror'>{this.props.message}</div>)
  }
});
React.render(<App />, document.getElementById('app'));