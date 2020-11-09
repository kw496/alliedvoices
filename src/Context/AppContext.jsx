import React, { Component, createContext } from 'react'
import { getLocation } from '../utils/geolocationdb';
import { getVoices, getResources } from "../utils/airtable"
import { getGeocodeInformationFor } from "../utils/geocoder"
export const AppContext = createContext();

class AppContextProvider extends Component {
  state = {
    lat: 39,
    lng: -98,
    locations: [],
    voices: {rows:[]},
    resources: {},
    selected: 99,
    selectedLat:39,
    selectedLng:-98,
    articleToggled:false,
    filterOptions: {
      'Location Tags': [],
      'Race': [],
      'Type': [],
      'Content Type': [],
      'Incident type': [],
    },
    options: []

  }

  // Get Initial Location, Voices and Resources
  componentDidMount = async () => {
    const { lat, lng, locations } = await getLocation()
    this.setState({
      lat: lat,
      lng: lng,
      locations: locations,
      selectedLat: lat,
      selectedLng: lng
    }, () => {

      getVoices(this.state.lat, this.state.lng, (voices) => {
        this.setState({
          voices
        })
      });

      // getVoices(40.73, -73.93, (voices) => {
      //   this.setState({
      //     voices
      //   })
      // });

      getResources(this.state.locations, (resources) => {
        this.setState({
          resources
        })
      });

    })
  }

  // Update Location and Get New Voices
  updateLocation = async (newLocation) => {
    // Use Google Geocode to convert newLocation to coordinates, and to determine the town, city, and state name if user the user did not provide it.
    const { lat, lng, locations } = await getGeocodeInformationFor(newLocation);

    // Return if the newLocation is not recognized by a geocoder
    if(!lat || !lng || !locations){
      return false;
    }

    // Update State and then make calls to get new voices and resources
    this.setState({
      lat: lat,
      lng: lng,
      locations: locations,
      selectedLat: lat,
      selectedLng: lng
    }, () => {

      getVoices(this.state.lat, this.state.lng, this.state.filterOptions, (voices) => {
        this.setState({
          voices
        })
      });

      getResources(this.state.locations, (resources) => {
        this.setState({
          resources
        })
      });

    })

  }

  selectArticle = (index) => {
    if(index!==this.state.selected){
      this.setState({
        selected:index,
        selectedLat:this.state.voices.rows[index].lat,
        selectedLng:this.state.voices.rows[index].lng,
        articleToggled:true
      })
    }
  }

  closeArticle = () => {
    this.setState({
      articleToggled:false
    })
  }

  // setFilterOptions = (filterKey, filterOption) => {
  //   // the index of the filtering options
  //   let index = this.state.filterOptions[filterKey].findIndex((option) => option === filterOption);
  //   // all the filtering options in an array
  //   let newArr = [...this.state.filterOptions[filterKey]];
  //   // if the index of the filter option is not newly added
  //   if(index !== -1){
  //     // then remove that element at the index
  //     newArr.splice(index, 1);
  //   }else{
  //     // if the index of the filtering option is newly added then
  //     // add the filtering option to the array of the filtering options
  //     newArr.push(filterOption);
  //   }
  //   // 
  //   this.setState({
  //     filterOptions: {...this.state.filterOptions, [filterKey]:newArr}
  //   })
  // }



  filterVoices = (filterKey, filterOptions) => {
    this.setState({
      // ...this.state.filterOptions - taking all the previous filter options (spread operator) and set it to a new state -> [filterKey]:filterOptions 
      // [filterKey]:filterOptions  = the selected 
      // filterKey - one of the filterOptions
      // filterOptions - the options of each Filter Type
      
      filterOptions: {...this.state.filterOptions, [filterKey]:filterOptions}
    }, ()=> {
      //then get articles of the selected options
      getVoices(this.state.lat, this.state.lng, this.state.filterOptions, (voices) => {
        this.setState({
          voices
        })
      });
    })
  }

  //clearvoices
  clearVoices(){
    
  }


  render() {
    return (
      <AppContext.Provider value={{ 
        ...this.state,
        updateLocation:this.updateLocation,
        filterVoices:this.filterVoices,
        selectArticle:this.selectArticle,
        closeArticle:this.closeArticle
       }}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export default AppContextProvider;