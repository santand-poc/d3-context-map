import {ContextMapModel} from './map.models';

export const ResultMap: ContextMapModel = {
  "name": "ContextMapModel",
  "domains": [],
  "contexts": [
    {
      "name": "CLP_CorporateCustomer",
      "width": 300,
      "height": 110,
      "shape": "rounded",
      "description" : "Opis...",
      "details": {
        "systemName": "CLP"
      },
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 1386,
      "y": 36
    },
    {
      "name": "CLP_ProductRepository",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 317.0151957661109,
      "y": 47.429104084481274
    },
    {
      "name": "CLP_ProductStandard",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 893.590845211181,
      "y": 347.62620952523304
    },
    {
      "name": "CLP_ProductNonStandard",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 1030.161836123287,
      "y": 810.8093344751212
    },
    {
      "name": "CLP_ProductRelations",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 718.8998925113566,
      "y": 703.5788086782568
    },
    {
      "name": "CLP_Collateral",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 232.59326390763005,
      "y": 446.030302224935
    },
    {
      "name": "CLP_CovenantsAndConditions",
      "domainTags": ['Risk', 'Legal', 'ProductMng', 'CollateralMng', 'Monitoring'],
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 454.2509421316347,
      "y": 586.6992642844192
    },
    {
      "name": "CLP_Reports",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 1384,
      "y": 154
    },
    {
      "name": "CLP_Profitability",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": -297.9107440687551,
      "y": 907.1441844592651
    },
    {
      "name": "CLP_Policy",
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "CLP"
      },
      "shape": "rounded",
      "style": {
        "fill": "#002244",
        "stroke": "#88ccff",
        "dash": null
      },
      "x": 1384,
      "y": 274
    },
    {
      "name": "DE_Profitability",
      "style": {
        "fill": "#d26c00",
        "stroke": "#88ccff",
        "dash": null
      },
      "width": 300,
      "height": 110,
      "details": {
        "systemName": "DE"
      },
      "shape": "rounded",
      "x": -298.0253426374591,
      "y": 1058.5866168901593
    }
  ],
  "relationships": [
    {
      "to": "CLP_ProductStandard",
      "from": "CLP_ProductRepository",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_ProductNonStandard",
      "from": "CLP_ProductRepository",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_ProductNonStandard",
      "from": "CLP_ProductStandard",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_ProductRelations",
      "from": "CLP_ProductRepository",
      "fromIntegrations": [
        "CF"
      ],
      "toIntegrations": [
        "OHS"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_CovenantsAndConditions",
      "from": "CLP_ProductRepository",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Profitability",
      "from": "CLP_ProductRepository",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Profitability",
      "from": "CLP_Collateral",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Profitability",
      "from": "CLP_CovenantsAndConditions",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Profitability",
      "from": "CLP_ProductNonStandard",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Profitability",
      "from": "DE_Profitability",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Profitability",
      "from": "CLP_ProductRelations",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    },
    {
      "to": "CLP_Collateral",
      "from": "CLP_ProductRepository",
      "fromIntegrations": [
        "OSH-PL"
      ],
      "toIntegrations": [
        "ACL"
      ],
      "style": {
        "color": "#00bbee",
        "dash": null,
        "marker": null
      }
    }
  ],
  "layoutMode": "manual"
}
