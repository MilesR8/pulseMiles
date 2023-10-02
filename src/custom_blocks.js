document.addEventListener('DOMContentLoaded', function () {


    const toolbox = {
        "kind":"categoryToolbox",
        "contents":[
            {
                "kind":"category",
                "name":"Robot Control",
                "contents":[
                    {
                        "kind":"block",
                        "type":"move"
                    },
                    {
                        "kind":"block",
                        "type":"waypoint"
                    },
                    {
                        "kind":"block",
                        "type":"coordinate_input"
                    },
                    {
                        "kind":"block",
                        "type":"waypoint_control"
                    },
                ]
            },
            {
                "kind":"category",
                "name":"Logic",
                "contents":[
                    {
                        "kind":"block",
                        "type":"controls_repeat_custom"
                    },
                ]
            }
        ]
    }


    Blockly.Blocks['controls_repeat_custom'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Repeat")
                .appendField(new Blockly.FieldNumber(0), "TIMES")
                .appendField("times");
            this.appendStatementInput("DO")
                .appendField("Do:")
                .setCheck("move"); // Replace with your desired block type
            this.setInputsInline(true);
            this.setPreviousStatement(true, ["controls_repeat_custom", "move"]);
            this.setNextStatement(true, ["controls_repeat_custom", "move"]);
            this.setColour(20);
            this.setTooltip("Repeat a set of actions a specified number of times.");
            this.setHelpUrl("");
        }
    };


    Blockly.Blocks['move'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Move to");
            this.appendStatementInput('WAYPOINT')
                .setCheck('waypoint')
                .appendField('Waypoint:');
            this.setPreviousStatement(true, "move");
            this.setNextStatement(true, "move");
            this.setColour(40);
            this.setTooltip('Moves the robot through the inserted waypoints');
        }
    };
    
    Blockly.Blocks['waypoint'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Waypoint");
            this.appendValueInput('COORDINATES')
                .setCheck('waypoint_destination')
                .appendField('Coordinates to move to:');
            this.appendValueInput('WAYPOINT_CONTROLS')
                .setCheck('waypoint_controls')
                .appendField('Optional Controls:');
            this.setPreviousStatement(true, 'waypoint');
            this.setNextStatement(true, 'waypoint');
            this.setColour(60);
            this.setTooltip('Create a waypoint with X, Y, and Z coordinates and optional control blocks.');
        }
    };

        Blockly.Blocks['coordinate_input'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Coords:")
                .appendField("X:")
                .appendField(new Blockly.FieldNumber(0), 'X')
                .appendField("Y:")
                .appendField(new Blockly.FieldNumber(0), 'Y')
                .appendField("Z:")
                .appendField(new Blockly.FieldNumber(0), 'Z');
            this.setOutput(true, 'waypoint_destination');
            this.setColour(80);
            this.setTooltip('Specify X, Y, and Z coordinates.');
        }
    };
    
    Blockly.Blocks['waypoint_control'] = {
        init: function() {
            this.appendDummyInput()
                .appendField('Acceleration:')
                .appendField(new Blockly.FieldNumber(0), 'ACCELERATION')
                .setAlign(Blockly.ALIGN_RIGHT);
            this.appendDummyInput()
                .appendField('Speed:')
                .appendField(new Blockly.FieldNumber(0), 'SPEED')
                .setAlign(Blockly.ALIGN_RIGHT);
            this.setOutput(true, 'waypoint_controls');
            this.setColour(80); 
            this.setTooltip('Set acceleration and speed for the waypoint.');
        }
    };
    



    const workspace = Blockly.inject('blocklyDiv', {
        media: '../lib/blockly/media/',
        toolbox: toolbox,
        toolboxPosition: 'start',
    });



    function generatePythonCode() {


        const code = python.pythonGenerator.workspaceToCode(workspace);
    
        // Add import statements and robot initialization
        let pythonCode = 'import webots\n\n';
        pythonCode += 'robot = webots.Robot()\n';
        pythonCode += 'motor = robot.getMotor("motor_name")\n\n';
    
        // Concatenate the generated Python code
        pythonCode += code;
        document.getElementById('generated-code').innerText = pythonCode;
        console.log(pythonCode);
    }
    
    // Define the Python code generation for each block type
    Blockly.Python.forBlock['move'] = function (block) {
        const waypointsCode = Blockly.Python.statementToCode(block, 'WAYPOINT');
        return waypointsCode;
    };
    
    Blockly.Python.forBlock['waypoint'] = function (block) {
        const coordinatesCode = Blockly.Python.valueToCode(block, 'COORDINATES', Blockly.Python.ORDER_ATOMIC);
        const waypointControlsCode = Blockly.Python.valueToCode(block, 'WAYPOINT_CONTROLS', Blockly.Python.ORDER_ATOMIC);
        
        const code = 'motor.setPosition(' + coordinatesCode + ')\n';
        
        return code;
    };
    
    Blockly.Python.forBlock['coordinate_input'] = function (block) {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        const z = block.getFieldValue('Z');
        
        return ['webots.Vector3(' + x + ', ' + y + ', ' + z + ')', Blockly.Python.ORDER_ATOMIC];
    };
    
    Blockly.Python.forBlock['waypoint_control'] = function (block) {
        const acceleration = block.getFieldValue('ACCELERATION');
        const speed = block.getFieldValue('SPEED');
        
        return [`# Set acceleration and speed: Acceleration: ${acceleration}, Speed: ${speed}`,  Blockly.Python.ORDER_ATOMIC];
    };
    
    Blockly.Python.forBlock['controls_repeat_custom'] = function (block) {
        const times = block.getFieldValue('TIMES');
        const doCode = Blockly.Python.statementToCode(block, 'DO');
        
        return `for i in range(${times}):\n${doCode}\n`;
    };
    
    // Attach the code generation function to the button click event
    document.getElementById('generateCodeButton').addEventListener('click', generatePythonCode);

    // keep submenu open
    workspace.toolbox_.flyout_.autoClose = false;
});
