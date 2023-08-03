# Slideshow Card
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

Slideshow Card for Home Assistant's UI LoveLace

**Updated to work with 2023.4+ Home Assistant**

## Configuration Variables

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:slideshow-card`
| cards | list | **Required**/**Optional** | List of cards `Reqires 2 or more cards` `Only Optional if folder=true`
| style | list | **Optional** | List of Style attributes
| arrow_color | string | **Optional** | Color of the Navigational Arrows or `transparent`, `Default: Black`
| arrow_opacity | string | **Optional** | Opacity of the Navigational Arrows, `Default: 1`
| fill | boolean | **Optional** | Makes the inner Cards fill the container, `Default: false`
| auto_play | boolean | **Optional** | Option to turn on/off auto switching of the cards, `Default: false`
| auto_delay | string | **Optional** | Seconds between switching to next card when autoplay=true, `Default: 5`
| no_fade | boolean | **Optional** | Set to true to prevent a fade between each card, `Default: false`
| folder | entity | **Optional** | This is for dynamically pulling images from a folder `See Dynamic Slideshow`
| folder_sort | boolean | **Optional** | If true, will sort the flie list by name `Default: false`


## Added Child Card Variables

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| style | list | **Optional** | List of Style Attributes per Card - This allows for styling of Child Cards

## Dynamic Slideshow

This allows you add images to a folder in your WWW folder that contains images you would like the see in the slideshow. Currently, this requires over writing the Folder Sensor so that the client can see the files. I am working on a built in method but wanted to get this feature available.

1. Add the folder sensor to your configuration.yaml file
    ```yaml
    - sensor
        - platform: folder
          folder: /config/www/images
    ```
2. Create a folder in your `WWW` folder named `images`
3. Add your images to this folder
4. Restart Home Assistant
5. Check the sensor.images entity to see if the `file_list` attribute lists your image files
6. Add a card to your ui-lovelace.yaml
    ```yaml
    - type: custom:slideshow-card
      folder: sensor.images
    ```
    * The other configuration variables are still available to use
    * You will need at least one card defined
7. Refresh your Lovelace Frontend

Any files you add to the folder should automatically get added to the slide show


## Installation

1. Add repo to HACS
2. Install via HACS
3. Copy below to your resources section

```yaml
resources:
  - url: /hacsfiles/slideshow-card/slideshow-card.js
    type: module
```

## Example Configuration

```yaml
- type: custom:slideshow-card
  fill: true
  arrow_color: White
  arrow_opacity: .5
  auto_play: true
  auto_delay: 4
  style:
    'border-radius': '25px'
  cards:
    - type: picture
      image: /local/images/1.jpg
    - type: picture
      image: /local/images/2.jpg
    - type: picture
      image: /local/images/3.jpg
```

![Example 1](https://i.gyazo.com/2ec6758472c4802cac7deb4f2beb777e.gif)

```yaml
- type: custom:slideshow-card
  arrow_color: var(--primary-text-color)
  arrow_opacity: .7
  cards:
    - type: glance
      column_width: 30%
      entities:
        - entity: device_tracker.person1
          name: Person 1
        - entity: device_tracker.person2
          name: Person 2
        - entity: sensor.house_alarm_sensor
        - entity: sensor.to_work
          icon: mdi:car
          name: To Work
        - entity: sensor.to_store
          icon: mdi:car
          name: To Store
    - type: glance
      column_width: 30%
      entities:
        - entity: light.light_1
          name: Light 1
          tap_action: toggle
        - entity: light.light_2
          name: Light 2
          tap_action: toggle
        - entity: light.light_3
          name: Light 3
          tap_action: toggle
        - light.office_1
        - light.office_2
    - type: glance
      column_width: 30%
      entities:
        - light.bedroom_1
        - light.bedroom_2
        - light.bedroom_3
        - light.bedroom_lamp_2
```

![Example 2](https://i.gyazo.com/9a344f995906b43e42b8be85e9c8d675.gif)

```yaml
- type: custom:slideshow-card
  arrow_color: var(--primary-text-color)
  arrow_opacity: .5
  cards:
    - type: picture
      image: /local/images/1.jpg
      style:
        'border-radius': '25px'
    - type: picture
      image: /local/images/2.jpg
    - type: picture
      image: /local/images/3.jpg
      style:
        'border-radius': '10px'
```

![Example 3](https://i.gyazo.com/662d39821d47a6131daf235a6876cf41.gif)

## Future Updates
* Option for Outer Card to stay the max-height of any card in the Slideshow
  * This removes the height chainging when switching cards
* Adding Swiping Gestures for Mobile use

## Credits

Thank you to @thomasloven for his [Custom Cards](https://community.home-assistant.io/t/my-lovelace-plugins/70726) to work from and his help when creating this card

## Updates

Breaking Changes:

    * Flush has been replaced with fill
    * arrowcolor has been replaced with arrow_color
    * arrowopacity has been replaced with arrow_opacity
    * auotplay has been replaced with auto_play
    * autodelay has been replaced with auto_delay
Other Changes:

    * Dynamic Slideshow
