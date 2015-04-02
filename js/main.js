/** @jsx React.DOM */
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
       var url = 'http://api.openweathermap.org/data/2.5/forecast?lat='+position.coords.latitude+'&lon='+position.coords.longitude;
       atomic.get(url)
        .success(function (data, xhr) {
          if (_this.isMounted()){
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
  render:function(){
    return (
        <span className="test">{this.props.data.weather[0].main}</span>
    )
  }
});
React.render(<App />, document.getElementById('app'));