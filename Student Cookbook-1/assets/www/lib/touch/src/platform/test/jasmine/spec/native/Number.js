describe("Number augmentation", function() {
    var Number = Ext.util.Numbers;
    
    describe("constraining a number", function() {
        describe("integers", function() {
            describe("if the number is within the constaints", function() {
                it("should leave the number alone if it is equal to the min and the max", function() {
                    expect(Number.constrain(1, 1, 1)).toEqual(1);
                });

                it("should leave the number alone if it is equal to the min", function() {
                    expect(Number.constrain(1, 1, 5)).toEqual(1);
                });

                it("should leave the number alone if it is equal to the max", function() {
                    expect(Number.constrain(5, 1, 5)).toEqual(5);
                });

                it("should leave the number alone if it is within the min and the max", function() {
                    expect(Number.constrain(3, 1, 5)).toEqual(3);
                });

                it("should leave a negative number alone if it is within the min and the max", function() {
                    expect(Number.constrain(-3, -5, -1)).toEqual(-3);
                });
            });
            
            describe("if the number is not within the constraints", function() {
                it("should make the number equal to the min value", function() {
                    expect(Number.constrain(1, 3, 5)).toEqual(3);
                });
                
                it("should make the number equal to the max value", function() {
                    expect(Number.constrain(100, 1, 5)).toEqual(5);
                });
                
                describe("and the number is negative", function() {
                    it("should make the number equal to the min value", function() {
                        expect(Number.constrain(-10, -50, -30)).toEqual(-30);
                    });
                    
                    it("should make the number equal to the max value", function() {
                        expect(Number.constrain(-100, -50, -30)).toEqual(-50);
                    });
                });
            });
        });
        
        describe("floating point numbers", function() {
            describe("if the number is within the constaints", function() {
                it("should leave the number alone", function() {
                    expect(Number.constrain(3.3, 3.1, 3.5)).toEqual(3.3);
                });
            
                it("should leave a negative number alone", function() {
                    expect(Number.constrain(-3.3, -3.5, -3.1)).toEqual(-3.3);
                });
            });
            
            describe("and the number is negative", function() {
                it("should make the number equal to the min value", function() {
                    expect(Number.constrain(-3.3, -3.1, -3)).toEqual(-3.1);
                });
                
                it("should make the number equal to the max value", function() {
                    expect(Number.constrain(-2.1, -3.1, -3)).toEqual(-3);
                });
            });
        });
    });
});