# Alexa Skill for Emmett's Bed Controller

## Setup

```
sudo npm install -g aws-cli
```

## Alexa Skill Utterances

Available commands:

- Say: "Set `Bed Position` to `SETTING`"
    - `SETTING`: `FLAT`, `MEMO A` (`SLEEP`), `MEMO B` (`HANGING OUT`)
    - Action: Bed will move to Memo A, Memo B or a zeroed/Flat position
- Say: "Move `BED_SECTION` `ACTION`"
    - `BED_SECTION`: `HEAD` (`TORSO`), `FOOT` (`LEGS`), `BED` (`BED HEIGHT`)
    - `ACTION`: `UP` (`RAISE`), `DOWN` (`LOWER`), `STOP` (`HALT`)
    - Action: The part of the bed specified will move up, down or stop moving (Stop applies to all movement).
    - Movement Length: 30 seconds
        
## Resources

- Alexa Device APIs:
  - https://developer.amazon.com/docs/device-apis/alexa-modecontroller.html
  - https://developer.amazon.com/docs/device-apis/alexa-togglecontroller.html#turnon
  - https://developer.amazon.com/docs/device-apis/alexa-rangecontroller.html
  - https://developer.amazon.com/docs/device-apis/alexa-powerlevelcontroller.html
- [Setting up an Alexa Skill Beta Test](https://developer.amazon.com/docs/custom-skills/skills-beta-testing-for-alexa-skills.html)
- [Useful guide](https://medium.com/@thebelgiumesekid/how-to-create-an-alexa-enabled-smart-home-with-particle-photon-part-2-8590314688e8) 